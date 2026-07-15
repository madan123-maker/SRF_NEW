import { PrismaClient, AppStatus, Application } from '@prisma/client';
import { PaginationDto, UpdateAnswersDto } from '../dto/application.dto';

const prisma = new PrismaClient();

export class ApplicationRepository {
  async createDraft(editionId: string, organizationId: string, submitterId: string): Promise<Application> {
    return prisma.application.create({
      data: {
        editionId,
        organizationId,
        submitterId,
        status: AppStatus.DRAFT,
      }
    });
  }

  async findByEditionAndOrg(editionId: string, organizationId: string): Promise<Application | null> {
    return prisma.application.findUnique({
      where: {
        editionId_organizationId: {
          editionId,
          organizationId
        }
      }
    });
  }

  async findByIdAndOrg(applicationId: string, organizationId: string) {
    return prisma.application.findFirst({
      where: {
        id: applicationId,
        organizationId,
        deletedAt: null
      },
      include: {
        answers: {
          where: { deletedAt: null }
        },
        edition: true
      }
    });
  }

  async findPaginatedByOrg(organizationId: string, options: PaginationDto) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where = {
      organizationId,
      deletedAt: null,
      // Handle search/filter if needed
      ...(options.search ? {
        edition: {
          name: { contains: options.search, mode: 'insensitive' as const }
        }
      } : {})
    };

    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        include: { edition: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.application.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateAnswers(applicationId: string, dto: UpdateAnswersDto) {
    // Upsert each answer. In Prisma, we can do this sequentially in a transaction
    return prisma.$transaction(
      dto.answers.map(answer => 
        prisma.applicationAnswer.upsert({
          where: {
            applicationId_formFieldId: {
              applicationId,
              formFieldId: answer.formFieldId
            }
          },
          update: {
            valueText: answer.valueText !== undefined ? answer.valueText : undefined,
            valueNumeric: answer.valueNumeric !== undefined ? answer.valueNumeric : undefined,
            valueBoolean: answer.valueBoolean !== undefined ? answer.valueBoolean : undefined,
            valueDate: answer.valueDate !== undefined ? new Date(answer.valueDate!) : undefined,
            valueJson: answer.valueJson !== undefined ? (answer.valueJson ? JSON.stringify(answer.valueJson) : null) : undefined,
          },
          create: {
            applicationId,
            questionId: answer.questionId,
            formFieldId: answer.formFieldId,
            valueText: answer.valueText,
            valueNumeric: answer.valueNumeric,
            valueBoolean: answer.valueBoolean,
            valueDate: answer.valueDate ? new Date(answer.valueDate) : null,
            valueJson: answer.valueJson ? JSON.stringify(answer.valueJson) : null,
          }
        })
      )
    );
  }

  async submitApplication(applicationId: string): Promise<Application> {
    return prisma.application.update({
      where: { id: applicationId },
      data: {
        status: AppStatus.SUBMITTED,
        submittedAt: new Date()
      }
    });
  }
}
