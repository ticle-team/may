ALTER TABLE
    may.threads
    ADD COLUMN shaple_project_id bigint REFERENCES shaple_builder.projects(id);