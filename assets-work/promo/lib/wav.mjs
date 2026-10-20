/** Duration in seconds from a RIFF/WAVE buffer, walking chunks (LIST etc. may precede data). */
export function wavDurationSeconds(buf) {
    if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
        throw new Error('not a RIFF/WAVE file');
    }
    let byteRate = null;
    let dataSize = null;
    let offset = 12;
    while (offset + 8 <= buf.length) {
        const id = buf.toString('ascii', offset, offset + 4);
        const size = buf.readUInt32LE(offset + 4);
        const body = offset + 8;
        if (id === 'fmt ') byteRate = buf.readUInt32LE(body + 8);
        if (id === 'data') {
            dataSize = Math.min(size, buf.length - body);
            break;
        }
        offset = body + size + (size % 2);
    }
    if (byteRate == null) throw new Error('fmt chunk not found');
    if (dataSize == null) throw new Error('data chunk not found');
    return Math.round((dataSize / byteRate) * 1000) / 1000;
}
