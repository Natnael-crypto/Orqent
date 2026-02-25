import { userRepository } from "@/repositories/UserRepository";
import bcrypt from "bcrypt";
import { UserSchema, UserUpdateSchema } from "@/lib/validation";
import { ApiError } from "@/lib/api-error";
import { z } from "zod";

export class UserService {
    async register(data: z.infer<typeof UserSchema>) {
        // Validate input
        const validated = UserSchema.parse(data);

        // Check if user already exists
        const existing = await userRepository.findByEmail(validated.email);
        if (existing) {
            throw new ApiError(409, "User already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validated.password, 10);

        // Create user
        return userRepository.create({
            name: validated.name,
            email: validated.email,
            companyName: validated.companyName,
            role: validated.role,
            isEmailVerified: false,
            password: hashedPassword,
        });
    }

    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new ApiError(401, "Invalid credentials");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new ApiError(401, "Invalid credentials");
        }

        return user;
    }

    async getUserProfile(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        // Exclude password
        const { password, ...profile } = user;
        return profile;
    }

    async updateProfile(userId: string, data: Partial<z.infer<typeof UserSchema>>) {
        // Only allow updating name and companyName for now
        const { name, companyName } = data;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (companyName !== undefined) updateData.companyName = companyName;

        // Validate
        UserUpdateSchema.parse(updateData);

        return userRepository.update(userId, updateData);
    }
}

export const userService = new UserService();
