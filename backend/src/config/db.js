import { Sequelize, DataTypes } from "sequelize";
import umzugPkg from "umzug";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";
import { databaseUrl } from "./environment.js";

dotenv.config();

const { Umzug } = umzugPkg;
const SequelizeStorage = umzugPkg.SequelizeStorage || umzugPkg.default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sequelize configuration
const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  pool: {
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10, // reduce pool size for desktop app
    min: 1,
    idle: 10000, // time a connection can be idle before being released
    acquire: 30000, // max time Sequelize tries to get connection before failing
    evict: 1000, // time before connection eviction
  },
  define: {
    timestamps: true,
    freezeTableName: true,
  },
  logging: process.env.DEBUG === "true" ? console.log : false, // use DEBUG from env
  dialectOptions: {
    application_name: "ProBillDeskApp", // helps identify app in pg_stat_activity
  },
});

// Umzug configuration
const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, "../migrations/*.js"),
    resolve: ({ name, path, context }) => {
      const migration = require(path); // assumes CJS migration files
      return {
        name,
        up: async () => migration.up(context),
        down: async () => migration.down(context),
      };
    },
    context: sequelize.getQueryInterface(),
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Connect DB and run appropriate actions
async function connectDB() {
  try {
    console.log('🔌 Attempting to connect to PostgreSQL database...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    logger("✅ DB connection successful", "i");

    if (process.env.PROD === "true") {
      console.log('🚀 Running migrations (PROD=true)...');
      logger("🚀 Running migrations (PROD=true)...", "i");
      await runMigrations();
    } else {
      console.log('⚙️  Running syncModels() (PROD=false)...');
      logger("⚙️  Running syncModels() (PROD=false)...", "w");
      await syncModels();
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    logger(`❌ DB connection failed: ${error.message}`, "e");
    throw error; // Re-throw to be caught by server.js
  }
}

// Run all pending migrations
async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    await umzug.up();
    console.log('✅ All migrations applied successfully!');
    logger("✅ All migrations applied", "i");
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    logger(`❌ Migration error: ${err.message}`, "e");
    throw err;
  }
}

// Roll back last migration
async function revertMigrations() {
  try {
    await umzug.down();
    logger("↩️  Last migration reverted", "i");
  } catch (err) {
    logger(`❌ Revert migration error: ${err.message}`, "e");
  }
}

// Sync models (dev only — safe with alter: true)
async function syncModels() {
  try {
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced with database successfully!');
    logger("✅ Models synced with DB (altered safely)", "i");
  } catch (err) {
    console.error('❌ Model sync failed:', err.message);
    logger(`❌ Model sync failed: ${err.message}`, "e");
    throw err;
  }
}

// Ensure DECIMAL types are parsed as floats globally
DataTypes.DECIMAL.parse = value => parseFloat(value);

export {
  sequelize,
  connectDB,
  runMigrations,
  revertMigrations,
  umzug,
  syncModels,
};
