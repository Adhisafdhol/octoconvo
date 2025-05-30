import prisma from "./client";

const deleteCommunityById = async (id: string) => {
  const deleteCommunity = prisma.community.delete({
    where: {
      id,
    },
  });

  const deleteInbox = prisma.inbox.delete({
    where: {
      communityId: id,
    },
  });

  const deleteParticipants = prisma.participant.deleteMany({
    where: {
      communityId: id,
    },
  });

  await prisma.$transaction([deleteInbox, deleteParticipants, deleteCommunity]);
};

const getCommunityByName = async (name: string) => {
  const community = await prisma.community.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  return community;
};

const createCommunity = async ({
  id,
  name,
  bio,
  avatar,
  banner,
}: {
  id: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
}) => {
  const community = await prisma.community.create({
    data: {
      name,
      bio,
      avatar,
      banner,
      inbox: {
        create: {
          inboxType: "COMMUNITY",
        },
      },
      participants: {
        create: {
          userId: id,
          role: "OWNER",
          status: "ACTIVE",
          memberSince: new Date(),
        },
      },
    },
    include: {
      participants: true,
    },
  });

  return community;
};

const getUserCommunities = async ({ userId }: { userId: string }) => {
  const communities = await prisma.community.findMany({
    where: {
      participants: {
        every: {
          userId: userId,
        },
      },
    },
    include: {
      inbox: true,
    },
  });

  return communities;
};

const getCommunityByIdAndParticipant = async ({
  communityId,
  participantId,
}: {
  communityId: string;
  participantId: string;
}) => {
  const community = await prisma.community.findUnique({
    where: {
      id: communityId,
      participants: {
        some: {
          userId: participantId,
        },
      },
    },
  });

  return community;
};

export {
  getCommunityByName,
  createCommunity,
  deleteCommunityById,
  getUserCommunities,
  getCommunityByIdAndParticipant,
};
