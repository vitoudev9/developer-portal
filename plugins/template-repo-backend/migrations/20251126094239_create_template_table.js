/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('template_storage', table => {
        table.text('id').primary();
        table.text('filename').notNullable();
        table.text('original_name').notNullable();
        table.text('created_by').notNullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.text('path').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('template_storage');
};
