import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const firesideRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ctx}) => {
      return ctx.db.fireside.findMany()
    }),
  create: protectedProcedure
    .input(z.object({ 
      displayName: z.string().min(1), 
      lng: z.number(), 
      lat: z.number(), 
      creatorId: z.string() 
    }))
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
