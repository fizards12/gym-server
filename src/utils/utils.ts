import User from "../model/users";

function generateRandomNumber(): number {
    return Math.floor(100000 + Math.random() * 900000); // Generates a random number between 100000 and 999999
}

export async function generateUniqueUserId(): Promise<number> {
    try {
        let uniqueId = generateRandomNumber();
        const user = await User.findOne({ member_id: uniqueId })
        while (user) {
            uniqueId = generateRandomNumber();
            const user = await User.findOne({ member_id: uniqueId })
        }
        return uniqueId;
    } catch (error: unknown) {
        throw error;
    }
}

export function uniquenessValidator<T>(property: T, propertyName: string): boolean {
    const user = User.findOne({ [propertyName]: property });
    return !user;
}

