import { MigrationInterface, QueryRunner } from 'typeorm';

export class radarfit1651886793693 implements MigrationInterface {
  name = 'radarfit1651886793693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`dateOfBirth\` varchar(30) NULL, \`plan\` varchar(30) NULL, \`phone\` varchar(30) NULL, \`planValidUntil\` timestamp NULL, \`forceUpdateFields\` text NULL, \`street\` varchar(100) NULL, \`number\` varchar(10) NULL, \`neighborhood\` varchar(100) NULL, \`city\` varchar(100) NULL, \`state\` varchar(100) NULL, \`country\` varchar(100) NULL, \`zip\` varchar(30) NULL, \`complement\` varchar(100) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`parentId\` int NULL, \`companyId\` int NULL, UNIQUE INDEX \`unique_email_when_deletedat_null\` (\`email\`), UNIQUE INDEX \`IDX_c4dd678058708647766157c6e4\` (\`email\`, \`deletedAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`companies\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`seats\` int NULL, \`primaryColor\` varchar(15) NULL, \`secondaryColor\` varchar(15) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_3dacbb3eb4f095e29372ff8e13\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_8110309ac51ed55a91d28625b88\` FOREIGN KEY (\`parentId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_6f9395c9037632a31107c8a9e58\` FOREIGN KEY (\`companyId\`) REFERENCES \`companies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_6f9395c9037632a31107c8a9e58\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_8110309ac51ed55a91d28625b88\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_3dacbb3eb4f095e29372ff8e13\` ON \`companies\``,
    );
    await queryRunner.query(`DROP TABLE \`companies\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_c4dd678058708647766157c6e4\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`unique_email_when_deletedat_null\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
