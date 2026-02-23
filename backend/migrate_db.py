from app.db.session import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as connection:
        print("Adding weight_target_kg to health_goals...")
        try:
            connection.execute(text("ALTER TABLE health_goals ADD COLUMN weight_target_kg FLOAT;"))
            connection.commit()
            print("Successfully added column.")
        except Exception as e:
            print(f"Error or column already exists: {e}")

if __name__ == "__main__":
    migrate()
