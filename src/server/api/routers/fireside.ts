import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const firesideRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.fireside.findMany();
  }),

  getByUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.fireside.findMany({
      where: {
        creatorId: ctx.session.user.id,
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        firesideId: z.number(),
        food: z.number(),
        water: z.number(),
        capacity: z.number(),
        medical: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.fireside.update({
        where: {
          id: input.firesideId,
        },
        data: {
          food: input.food,
          water: input.water,
          medical: input.medical,
          capacity: input.capacity,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1),
        lng: z.number(),
        lat: z.number(),
        creatorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.fireside.create({
        data: {
          displayName: input.displayName,
          lng: input.lng,
          lat: input.lat,
          creatorId: input.creatorId,
        },
      });
    }),
});
