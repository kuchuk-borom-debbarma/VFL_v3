import { Block, type BlockParams } from "../Block.ts";

/**
 * Metadata for Message Broker operations.
 */
export interface MessageMetadata {
  /** The messaging system (e.g., 'kafka', 'rabbitmq', 'sqs'). */
  system: string;
  /** The destination topic, queue, or exchange. */
  topic: string;
  /** Whether the message was being published or consumed. */
  action: 'publish' | 'consume';
  /** Unique identifier for the message. */
  messageId?: string;
}

export interface MessageBlockParams extends BlockParams<MessageMetadata> {}

/**
 * Represents a message being sent to or received from a broker.
 */
export class MessageBlock extends Block<MessageMetadata> {
  blockType = 'message';

  constructor(params: MessageBlockParams) {
    super(params);
  }
}
