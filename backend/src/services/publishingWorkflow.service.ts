import { ContentStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';

export interface WorkflowTransitionParams {
  entityType: string; // e.g. "NewsArticle", "VillagePlace", "Business", "Event"
  entityId: string;
  reviewerId: string;
  currentStatus: ContentStatus;
  targetStatus: ContentStatus;
  feedback?: string;
  actionName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Valid state transitions mapping:
 * currentStatus -> Set of allowed target statuses
 */
const VALID_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  [ContentStatus.DRAFT]: [
    ContentStatus.PENDING_REVIEW,
    ContentStatus.ARCHIVED,
  ],
  [ContentStatus.PENDING_REVIEW]: [
    ContentStatus.PUBLISHED,
    ContentStatus.CHANGES_REQUESTED,
    ContentStatus.REJECTED,
  ],
  [ContentStatus.CHANGES_REQUESTED]: [
    ContentStatus.DRAFT,
    ContentStatus.PENDING_REVIEW,
    ContentStatus.ARCHIVED,
  ],
  [ContentStatus.PUBLISHED]: [
    ContentStatus.ARCHIVED,
    // Note: When editors modify published content, it may be moved to PENDING_REVIEW or CHANGES_REQUESTED
    ContentStatus.PENDING_REVIEW,
  ],
  [ContentStatus.ARCHIVED]: [
    // Archived content can be restored to draft for re-evaluation
    ContentStatus.DRAFT,
  ],
  [ContentStatus.REJECTED]: [
    // Rejected content can be sent back to draft for complete rework or archived
    ContentStatus.DRAFT,
    ContentStatus.ARCHIVED,
  ],
};

export class PublishingWorkflowService {
  /**
   * Validates whether a state transition is permitted by the state machine
   */
  public isValidTransition(fromStatus: ContentStatus, toStatus: ContentStatus): boolean {
    const allowed = VALID_TRANSITIONS[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  }

  /**
   * Asserts transition validity or throws AppError (400)
   */
  public assertValidTransition(fromStatus: ContentStatus, toStatus: ContentStatus): void {
    if (!this.isValidTransition(fromStatus, toStatus)) {
      throw new AppError(
        `Invalid status transition from '${fromStatus}' to '${toStatus}'.`,
        400,
        'INVALID_WORKFLOW_TRANSITION',
        {
          fromStatus,
          toStatus,
          allowedTransitions: VALID_TRANSITIONS[fromStatus] || [],
        }
      );
    }
  }

  /**
   * Executes a workflow status transition atomically inside a Prisma transaction:
   * 1. Validates status transition rules
   * 2. Creates an immutable ContentReview entry
   * 3. Creates an immutable ActivityLog entry
   */
  public async recordStatusChange(
    tx: Prisma.TransactionClient,
    params: WorkflowTransitionParams
  ): Promise<{
    fromStatus: ContentStatus;
    toStatus: ContentStatus;
    reviewId: string;
  }> {
    // 1. Validate transition
    this.assertValidTransition(params.currentStatus, params.targetStatus);

    // 2. Insert ContentReview record (audit history)
    const review = await tx.contentReview.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        reviewerId: params.reviewerId,
        fromStatus: params.currentStatus,
        toStatus: params.targetStatus,
        feedback: params.feedback || null,
      },
    });

    // 3. Insert ActivityLog record
    const action = params.actionName || `WORKFLOW_${params.targetStatus}`;
    await tx.activityLog.create({
      data: {
        userId: params.reviewerId,
        action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: {
          fromStatus: params.currentStatus,
          toStatus: params.targetStatus,
          feedback: params.feedback,
          reviewId: review.id,
          ...params.metadata,
        },
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });

    return {
      fromStatus: params.currentStatus,
      toStatus: params.targetStatus,
      reviewId: review.id,
    };
  }

  /**
   * Retrieve complete review audit history for any content entity
   */
  public async getReviewHistory(entityType: string, entityId: string) {
    return prisma.contentReview.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}

export const publishingWorkflowService = new PublishingWorkflowService();

