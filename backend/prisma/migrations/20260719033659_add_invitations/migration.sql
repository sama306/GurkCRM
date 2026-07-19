BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Invitation] (
    [id] NVARCHAR(1000) NOT NULL,
    [organizationId] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [roleId] NVARCHAR(1000) NOT NULL,
    [invitedById] NVARCHAR(1000) NOT NULL,
    [tokenHash] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Invitation_status_df] DEFAULT 'PENDING',
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Invitation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [acceptedAt] DATETIME2,
    [revokedAt] DATETIME2,
    CONSTRAINT [Invitation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Invitation_organizationId_status_idx] ON [dbo].[Invitation]([organizationId], [status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Invitation_email_organizationId_idx] ON [dbo].[Invitation]([email], [organizationId]);

-- AddForeignKey
ALTER TABLE [dbo].[Invitation] ADD CONSTRAINT [Invitation_organizationId_fkey] FOREIGN KEY ([organizationId]) REFERENCES [dbo].[Organization]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Invitation] ADD CONSTRAINT [Invitation_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Invitation] ADD CONSTRAINT [Invitation_invitedById_fkey] FOREIGN KEY ([invitedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
