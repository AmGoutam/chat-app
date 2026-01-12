import { z } from "zod";


export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name is too long")
    .trim(),
  email: z.string().email("Invalid email format").trim().lowercase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).strict(); 


export const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim().lowercase(),
  password: z.string().min(1, "Password is required"),
}).strict();


export const validate = (schema) => (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ success: false, message: "Invalid request format" });
  }

  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.issues.map((issue) => ({
        path: issue.path[0],
        message: issue.message,
      })),
    });
  }

  req.body = result.data;
  
  next();
};