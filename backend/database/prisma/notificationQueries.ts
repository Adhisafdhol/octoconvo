import { Prisma } from "@prisma/client";
import prisma from "./client";

const createNotificationsTransaction = async ({
  tx,
  type,
  communityId,
  triggeredById,
  triggeredForIds,
  payload,
}: {
  tx: Prisma.TransactionClient;
  type: "COMMUNITYREQUEST" | "FRIENDREQUEST" | "REQUESTUPDATE";
  communityId: string | null;
  triggeredById: string;
  triggeredForIds: string[];
  payload: string;
}) => {
  type NotificationQuery = {
    type: "COMMUNITYREQUEST" | "FRIENDREQUEST" | "REQUESTUPDATE";
    communityId: string | null;
    triggeredById: string;
    triggeredForId: string;
    payload: string;
    isRead: boolean;
  };

  const createNotifications = triggeredForIds.map(
    async triggeredForId =>
      new Promise<NotificationQuery>(resolve => {
        resolve({
          type: type,
          communityId: communityId,
          triggeredById: triggeredById,
          triggeredForId: triggeredForId,
          payload: payload,
          isRead: false,
        });
      }),
  );

  const notifications: NotificationQuery[] =
    await Promise.all(createNotifications);

  return tx.notification.createManyAndReturn({
    data: [...notifications],
    include: {
      triggeredBy: {
        select: {
          username: true,
        },
      },
      triggeredFor: {
        select: {
          username: true,
        },
      },
      community: {
        select: {
          name: true,
        },
      },
    },
  });
};

const updateNotificationByIdTransaction = async ({
  tx,
  id,
  type,
  communityId,
  triggeredById,
  triggeredForId,
  payload,
  isRead,
  status,
}: {
  tx: Prisma.TransactionClient;
  id: string;
  type?: "COMMUNITYREQUEST" | "FRIENDREQUEST" | "REQUESTUPDATE";
  communityId?: string | null;
  triggeredById?: string;
  triggeredForId?: string;
  payload?: string;
  isRead: boolean;
  status: "REJECTED" | "ACCEPTED" | "COMPLETED" | "PENDING" | null;
}) => {
  return tx.notification.update({
    where: {
      id: id,
    },
    data: {
      ...(type !== null ? { type: type } : {}),
      ...(communityId || communityId === null
        ? { communityId: communityId }
        : {}),
      ...(triggeredById !== null ? { triggeredById: triggeredById } : {}),
      ...(triggeredForId !== null ? { triggeredForId: triggeredForId } : {}),
      ...(payload !== null ? { payload: payload } : {}),
      ...(isRead !== null ? { isRead: isRead } : {}),
      ...(status ? { status: status } : {}),
    },
    include: {
      triggeredBy: {
        select: {
          username: true,
        },
      },
      triggeredFor: {
        select: {
          username: true,
        },
      },
      community: {
        select: {
          name: true,
        },
      },
    },
  });
};

const getUserUnreadNotificationCount = async ({
  userId,
}: {
  userId: string;
}) => {
  const unreadNotificationCount = await prisma.notification.count({
    where: {
      triggeredForId: userId,
      isRead: false,
    },
  });

  return unreadNotificationCount;
};

const getUserNotifications = async ({
  userId,
  cursor,
  limit,
}: {
  userId: string;
  cursor: {
    createdAt: string;
    id: string;
  } | null;
  limit: number;
}) => {
  const notifications = await prisma.notification.findMany({
    where: {
      triggeredForId: userId,
      ...(cursor
        ? {
            OR: [
              {
                AND: [
                  {
                    id: {
                      lt: cursor.id,
                    },
                  },
                  { createdAt: cursor.createdAt },
                ],
              },
              {
                createdAt: {
                  lt: cursor.createdAt,
                },
              },
            ],
          }
        : {}),
    },
    include: {
      triggeredBy: {
        select: {
          username: true,
        },
      },
      triggeredFor: {
        select: {
          username: true,
        },
      },
      community: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    ...(limit ? { take: limit } : {}),
  });

  return notifications;
};

const getNotificationById = async (id: string) => {
  return await prisma.notification.findUnique({
    where: { id: id },
  });
};

export {
  createNotificationsTransaction,
  getUserUnreadNotificationCount,
  getUserNotifications,
  getNotificationById,
  updateNotificationByIdTransaction,
};
