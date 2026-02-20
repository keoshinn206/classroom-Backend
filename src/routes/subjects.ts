import { ilike, or, and, sql, eq, getTableColumns, desc } from "drizzle-orm";
import express from "express";
import {
  subjects,
  department as departmentTable,
  department,
} from "../db/schema/app.js";
import { db } from "../db/index.js";

const router = express.Router();

router.get("/api/departments", async (req, res) => {
  try {
    const {
      search,
      department: departmentQuery,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, Number(page));
    const limitPerpage = Math.max(1, Number(limit));
    const offset = (currentPage - 1) * limitPerpage;

    const filterConditions = [];

    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }

    if (departmentQuery) {
      filterConditions.push(ilike(department.name, `%${departmentQuery}%`));
    }

    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(subjects)
      .leftJoin(department, eq(subjects.departmentId, department.id))
      .where(whereClause);

    const totalcount = Number(countResult[0]?.count ?? 0);

    const SubjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: getTableColumns(department),
      })
      .from(subjects)
      .leftJoin(department, eq(subjects.departmentId, department.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerpage)
      .offset(offset);

    res.status(200).json({
      data: SubjectsList,
      Pagination: {
        page: currentPage,
        limit: limitPerpage,
        total: totalcount,
        totalPages: Math.ceil(totalcount / limitPerpage),
      },
    });
  } catch (e) {
    console.error(`GET /api/departments error: ${e}`);
    res.status(500).json({ error: "Failed to get subjects" });
  }
});

export default router;
