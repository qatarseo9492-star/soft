import db from "./db";

export async function updateSoftwareRatingsAggregate(softwareId: string) {
  const agg = await db.review.aggregate({
    where: { softwareId },
    _count: { _all: true },
    _avg: { rating: true },
  });
  const count = agg._count._all || 0;
  const avg = agg._avg.rating ? Number(agg._avg.rating.toFixed(2)) : 0;
  await db.software.update({
    where: { id: softwareId },
    data: { ratingsAvg: avg, ratingsCount: count },
    select: { id: true },
  });
  return { avg, count };
}
