import { VFLFlush, type FlushData } from "../Flush.ts";

/**
 * A simple flush that outputs the raw JSON state to the console.
 */
export class JsonFlush extends VFLFlush {
  async flush(data: FlushData): Promise<void> {
    console.log("--- JSON FLUSH START ---");
    console.log(JSON.stringify(data, null, 2));
    console.log("--- JSON FLUSH END ---");
  }
}
