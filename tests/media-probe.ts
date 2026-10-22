import { readFileSync } from 'node:fs';

export interface Probe {
  width: number;
  height: number;
  duration: number;
  hasAudio: boolean;
  codec: string;
}

const MP4_CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl']);
const VIDEO_CODECS: Record<string, string> = {
  avc1: 'h264',
  avc3: 'h264',
  hvc1: 'hevc',
  hev1: 'hevc',
  vp09: 'vp9',
  av01: 'av1',
};
const AUDIO_CODECS = new Set(['mp4a', 'ac-3', 'ec-3', 'Opus', 'fLaC', 'sowt', 'twos']);

const WEBM_MASTERS = new Set([
  0x1a45dfa3, // EBML
  0x18538067, // Segment
  0x1549a966, // Info
  0x1654ae6b, // Tracks
  0xae, // TrackEntry
  0xe0, // Video
  0xe1, // Audio
]);

/** Read width, height, duration, codec, and whether an audio track exists. No ffprobe. */
export function probeMedia(file: string): Probe {
  const bytes = readFileSync(file);
  if (bytes.length >= 4 && bytes.toString('latin1', 4, 8) === 'ftyp') return probeMp4(bytes);
  return probeWebm(bytes);
}

function probeMp4(bytes: Buffer): Probe {
  let timescale = 0;
  let durationUnits = 0;
  let width = 0;
  let height = 0;
  let codec = '';
  let hasAudio = false;

  const walk = (
    start: number,
    end: number,
    track: { video: boolean; width: number; height: number } | null,
  ) => {
    let offset = start;
    while (offset + 8 <= end) {
      let size = bytes.readUInt32BE(offset);
      const type = bytes.toString('latin1', offset + 4, offset + 8);
      let header = 8;
      if (size === 1) {
        size = Number(bytes.readBigUInt64BE(offset + 8));
        header = 16;
      } else if (size === 0) {
        size = end - offset;
      }
      if (size < header || offset + size > end) break;
      const body = offset + header;
      const boxEnd = offset + size;

      if (type === 'mvhd') {
        const version = bytes[body];
        if (version === 1) {
          timescale = bytes.readUInt32BE(body + 20);
          durationUnits = Number(bytes.readBigUInt64BE(body + 24));
        } else {
          timescale = bytes.readUInt32BE(body + 12);
          durationUnits = bytes.readUInt32BE(body + 16);
        }
      } else if (type === 'tkhd' && track) {
        track.width = Math.round(bytes.readUInt32BE(boxEnd - 8) / 65536);
        track.height = Math.round(bytes.readUInt32BE(boxEnd - 4) / 65536);
      } else if (type === 'hdlr' && track) {
        const handler = bytes.toString('latin1', body + 8, body + 12);
        if (handler === 'vide') track.video = true;
        if (handler === 'soun') hasAudio = true;
      } else if (type === 'stsd') {
        let entry = body + 8;
        while (entry + 8 <= boxEnd) {
          const entrySize = bytes.readUInt32BE(entry);
          if (entrySize < 8 || entry + entrySize > boxEnd) break;
          const format = bytes.toString('latin1', entry + 4, entry + 8);
          if (track?.video && VIDEO_CODECS[format]) codec = VIDEO_CODECS[format];
          if (AUDIO_CODECS.has(format)) hasAudio = true;
          entry += entrySize;
        }
      }

      if (type === 'trak') {
        const next = { video: false, width: 0, height: 0 };
        walk(body, boxEnd, next);
        if (next.video) {
          width = next.width;
          height = next.height;
        }
      } else if (MP4_CONTAINERS.has(type)) {
        walk(body, boxEnd, track);
      }
      offset = boxEnd;
    }
  };

  walk(0, bytes.length, null);
  return {
    width,
    height,
    duration: timescale > 0 ? durationUnits / timescale : 0,
    hasAudio,
    codec,
  };
}

function probeWebm(bytes: Buffer): Probe {
  let timescaleNs = 1_000_000;
  let durationTicks = 0;
  let width = 0;
  let height = 0;
  let codec = '';
  let hasAudio = false;
  let trackType = 0;

  const walk = (start: number, end: number) => {
    let offset = start;
    while (offset + 2 <= end) {
      const id = readVint(bytes, offset, true);
      if (!id) break;
      const size = readVint(bytes, offset + id.length, false);
      if (!size) break;
      const data = offset + id.length + size.length;
      const unknown = size.value === (1n << BigInt(size.length * 7)) - 1n;
      const dataEnd = unknown ? end : data + Number(size.value);
      if (dataEnd > end || dataEnd < data) break;
      const element = Number(id.value);

      if (element === 0x2ad7b1) timescaleNs = readUint(bytes, data, dataEnd);
      else if (element === 0x4489) durationTicks = readFloat(bytes, data, dataEnd);
      else if (element === 0x83) trackType = readUint(bytes, data, dataEnd);
      else if (element === 0x86) {
        const name = bytes.toString('utf8', data, dataEnd);
        if (name === 'V_VP9') codec = 'vp9';
        else if (name === 'V_VP8') codec = 'vp8';
        else if (name === 'V_AV1') codec = 'av1';
        else if (name.startsWith('A_')) hasAudio = true;
      } else if (element === 0xb0 && trackType === 1) width = readUint(bytes, data, dataEnd);
      else if (element === 0xba && trackType === 1) height = readUint(bytes, data, dataEnd);
      else if (trackType === 2) hasAudio = true;

      if (WEBM_MASTERS.has(element)) {
        const previous = trackType;
        if (element === 0xae) trackType = 0;
        walk(data, dataEnd);
        if (element === 0xae) trackType = previous;
      }
      if (unknown) break;
      offset = dataEnd;
    }
  };

  walk(0, bytes.length);
  return {
    width,
    height,
    duration: (durationTicks * timescaleNs) / 1e9,
    hasAudio,
    codec,
  };
}

function readVint(bytes: Buffer, offset: number, keepMarker: boolean) {
  if (offset >= bytes.length) return null;
  const first = bytes[offset];
  let length = 1;
  let marker = 0x80;
  while (length <= 8 && (first & marker) === 0) {
    length += 1;
    marker >>= 1;
  }
  if ((first & marker) === 0 || offset + length > bytes.length) return null;
  let value = BigInt(keepMarker ? first : first & (marker - 1));
  for (let i = 1; i < length; i += 1) value = (value << 8n) | BigInt(bytes[offset + i]);
  return { value, length };
}

function readUint(bytes: Buffer, start: number, end: number) {
  let value = 0;
  for (let i = start; i < end; i += 1) value = value * 256 + bytes[i];
  return value;
}

function readFloat(bytes: Buffer, start: number, end: number) {
  const size = end - start;
  if (size === 4) return bytes.readFloatBE(start);
  if (size === 8) return bytes.readDoubleBE(start);
  return 0;
}
