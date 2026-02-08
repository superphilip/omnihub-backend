import type { ComplianceCheck, User, UserDocument } from "../generated/prisma/client.js";

export interface FormattedRole {
    id: string;
    name: string;
}

export interface FormattedDocument {
    id: string;
    type: string;
    url: string;
    description: string | null;
    status: string;
    rejectionReason: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
}

export interface FormattedCompliance {
    id: string;
    amlRiskScore: number;
    lastReviewDate: Date;
    riskFlags: unknown;
    requiresManualApproval: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type FormattedUserResponse = Omit<User, 'password' | 'roleId'> & {
    role: FormattedRole | null;
    documents: FormattedDocument[];
    compliance: FormattedCompliance | null;
};

type UserInput = User & {
    role?: { id: string; name: string } | null;
    documents?: UserDocument[];
    complianceCheck?: ComplianceCheck | null;
};

export function excludePassword(user: UserInput): Omit<User, 'password' | 'roleId'> {
    const { password, roleId, role, documents, complianceCheck, ...userData } = user;
    return userData as Omit<User, 'password' | 'roleId'>;
}

export const formatUserResponse = (
    user: UserInput,
    documents?:  UserDocument[],
    compliance?: ComplianceCheck | null
): FormattedUserResponse => {
    const baseUrl = `http://${process.env.HOST}: ${process.env.PORT}`;
    const userDataClean = excludePassword(user);

    const roleFormatted:  FormattedRole | null = user.role 
        ? { id: user. role.id, name: user. role.name } 
        :  null;

    const documentsFormatted: FormattedDocument[] = documents ? documents.map(doc => ({
        id:  doc.id,
        type: doc.type,
        url: doc.url. startsWith('http') ? doc.url : `${baseUrl}${doc.url}`,
        description: doc.description,
        status: doc.status,
        rejectionReason: doc.rejectionReason,
        reviewedAt: doc.reviewedAt,
        createdAt: doc.createdAt
    })) : [];

    const complianceFormatted: FormattedCompliance | null = compliance ? {
        id: compliance.id,
        amlRiskScore: compliance.amlRiskScore,
        lastReviewDate: compliance.lastReviewDate,
        riskFlags: compliance.riskFlags,
        requiresManualApproval: compliance.requiresManualApproval,
        createdAt: compliance.createdAt,
        updatedAt: compliance.updatedAt
    } : null;

    return {
        ...userDataClean,
        role:  roleFormatted,
        compliance: complianceFormatted,
        documents: documentsFormatted
    };
};