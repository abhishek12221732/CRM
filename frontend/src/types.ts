  // Auth Types
  export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }

  // Segment Types
  export interface SegmentRule {
    id: string;
    field: string;
    operator: string;
    value: string | number;
    condition?: 'AND' | 'OR';
  }

  export interface CustomerSegment {
    id: string;
    name: string;
    rules: SegmentRule[];
    createdAt: Date;
    customerCount?: number;
  }

  // Campaign Types
  export interface Campaign {
    id: string;
    name: string;
    segmentId: string;
    segmentName: string;
    messageTemplate: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    createdAt: Date;
    scheduledAt?: Date;
    sentAt?: Date;
    audienceSize: number;
    deliveryStats: {
      sent: number;
      delivered: number;
      failed: number;
      opened?: number;
      clicked?: number;
    };
  }

  export interface FieldOption {
    id: string;
    label: string;
    type: 'number' | 'string' | 'date' | 'boolean';
  }


  // types.ts
  import type { ComponentType } from 'react';

  export type Page = 'dashboard' | 'audience-builder' | 'campaign-history' | 'settings' | 'ai-features' | 'login';

  export interface NavItem {
    id: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    page: Page;
  }
