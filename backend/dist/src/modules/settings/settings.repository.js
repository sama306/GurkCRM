"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRepository = void 0;
const prisma_1 = require("../../config/prisma");
exports.settingsRepository = {
    findByOrganizationId(organizationId) {
        return prisma_1.prisma.organization.findUnique({
            where: { id: organizationId },
        });
    },
    update(organizationId, data) {
        return prisma_1.prisma.organization.update({
            where: { id: organizationId },
            data,
        });
    },
};
//# sourceMappingURL=settings.repository.js.map