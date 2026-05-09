export interface Edge {
  id: string;
  traceId: string;
  fromBlockId: string;
  toBlockId: string;
  edgeType: string;
  metadata: Record<string, any>;
}
