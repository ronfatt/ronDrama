-- ==============================================================================
-- R.ON DRAMA STUDIO — PRODUCTION DATABASE SCHEMA
-- AI Series Production Workstation
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logline TEXT,
    genre VARCHAR(100),
    language VARCHAR(50) DEFAULT 'English',
    target_episodes INT DEFAULT 10,
    episode_duration VARCHAR(50) DEFAULT '5–10 minutes',
    aspect_ratio VARCHAR(20) DEFAULT '16:9',
    visual_style VARCHAR(100) DEFAULT 'Cinematic / Photorealistic',
    era VARCHAR(100),
    location VARCHAR(255),
    tone VARCHAR(255),
    reference_works TEXT,
    status VARCHAR(50) DEFAULT 'Pre-Production',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Project Bibles
CREATE TABLE IF NOT EXISTS project_bibles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    logline TEXT,
    genre VARCHAR(100),
    theme TEXT,
    tone TEXT,
    world TEXT,
    era VARCHAR(100),
    location VARCHAR(255),
    visual_style TEXT,
    color_language TEXT,
    camera_language TEXT,
    lighting_language TEXT,
    editing_rhythm TEXT,
    directors_vision TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_project_bible UNIQUE (project_id)
);

-- 3. Episodes
CREATE TABLE IF NOT EXISTS episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    logline TEXT,
    synopsis TEXT,
    runtime VARCHAR(50) DEFAULT '8 mins',
    status VARCHAR(50) DEFAULT 'Pre-Production',
    director_notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Scenes
CREATE TABLE IF NOT EXISTS scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    scene_number INT NOT NULL,
    scene_title VARCHAR(255) NOT NULL,
    int_ext VARCHAR(20) DEFAULT 'INT',
    location_name VARCHAR(255),
    time_of_day VARCHAR(50) DEFAULT 'NIGHT',
    story_purpose TEXT,
    emotion VARCHAR(100),
    conflict TEXT,
    duration VARCHAR(50) DEFAULT '2 mins',
    director_notes TEXT,
    -- Director Intention fields
    director_scene_purpose TEXT,
    director_emotional_arc TEXT,
    director_audience_experience TEXT,
    director_pacing VARCHAR(50) DEFAULT 'Tense',
    director_visual_strategy TEXT,
    director_performance_direction TEXT,
    director_camera_strategy TEXT,
    director_lighting_strategy TEXT,
    director_transition VARCHAR(100) DEFAULT 'Cut',
    production_status VARCHAR(50) DEFAULT 'SCRIPT READY',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Beats
CREATE TABLE IF NOT EXISTS beats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    beat_number INT NOT NULL,
    description TEXT NOT NULL,
    characters TEXT,
    action TEXT,
    emotional_shift TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Characters
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'Protagonist',
    age VARCHAR(50),
    gender VARCHAR(50),
    personality TEXT,
    physical_description TEXT,
    hair TEXT,
    face TEXT,
    body TEXT,
    height VARCHAR(50),
    costume TEXT,
    signature_features TEXT,
    performance_notes TEXT,
    locked_version_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Character Versions
CREATE TABLE IF NOT EXISTS character_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    version_tag VARCHAR(20) NOT NULL, -- V1, V2, V3, etc.
    reference_image_url TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SELECTED, LOCKED, ARCHIVED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Locations
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    architecture TEXT,
    environment TEXT,
    time VARCHAR(50),
    weather VARCHAR(50),
    lighting TEXT,
    color_palette TEXT,
    atmosphere TEXT,
    camera_notes TEXT,
    locked_version_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Location Versions
CREATE TABLE IF NOT EXISTS location_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    version_tag VARCHAR(20) NOT NULL,
    reference_image_url TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Props
CREATE TABLE IF NOT EXISTS props (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    material VARCHAR(100),
    color VARCHAR(100),
    size VARCHAR(100),
    function TEXT,
    story_importance VARCHAR(100),
    locked_version_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Prop Versions
CREATE TABLE IF NOT EXISTS prop_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prop_id UUID NOT NULL REFERENCES props(id) ON DELETE CASCADE,
    version_tag VARCHAR(20) NOT NULL,
    reference_image_url TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Costumes
CREATE TABLE IF NOT EXISTS costumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    material VARCHAR(100),
    color VARCHAR(100),
    accessories TEXT,
    shoes VARCHAR(100),
    condition VARCHAR(100),
    locked_version_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Costume Versions
CREATE TABLE IF NOT EXISTS costume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    costume_id UUID NOT NULL REFERENCES costumes(id) ON DELETE CASCADE,
    version_tag VARCHAR(20) NOT NULL,
    reference_image_url TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Shots
CREATE TABLE IF NOT EXISTS shots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    shot_number INT NOT NULL,
    shot_type VARCHAR(50) DEFAULT 'Medium',
    framing VARCHAR(50) DEFAULT 'Eye Level',
    camera_angle VARCHAR(50) DEFAULT 'Low Angle',
    lens VARCHAR(50) DEFAULT '35mm',
    camera_movement VARCHAR(100) DEFAULT 'Push In',
    subject TEXT,
    action TEXT,
    performance TEXT,
    environment TEXT,
    lighting TEXT,
    atmosphere TEXT,
    composition TEXT,
    depth TEXT,
    visual_effects TEXT,
    transition VARCHAR(50) DEFAULT 'Cut',
    duration VARCHAR(20) DEFAULT '3s',
    dialogue TEXT,
    sound TEXT,
    director_notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Scene Asset Join Tables
CREATE TABLE IF NOT EXISTS scene_characters (
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    version_id UUID REFERENCES character_versions(id) ON DELETE SET NULL,
    PRIMARY KEY (scene_id, character_id)
);

CREATE TABLE IF NOT EXISTS scene_locations (
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    version_id UUID REFERENCES location_versions(id) ON DELETE SET NULL,
    PRIMARY KEY (scene_id, location_id)
);

CREATE TABLE IF NOT EXISTS scene_props (
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    prop_id UUID NOT NULL REFERENCES props(id) ON DELETE CASCADE,
    version_id UUID REFERENCES prop_versions(id) ON DELETE SET NULL,
    PRIMARY KEY (scene_id, prop_id)
);

CREATE TABLE IF NOT EXISTS scene_costumes (
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    costume_id UUID NOT NULL REFERENCES costumes(id) ON DELETE CASCADE,
    version_id UUID REFERENCES costume_versions(id) ON DELETE SET NULL,
    PRIMARY KEY (scene_id, costume_id)
);

-- 16. Shot Prompts (Versioned Prompts)
CREATE TABLE IF NOT EXISTS shot_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shot_id UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
    version_tag VARCHAR(20) NOT NULL DEFAULT 'V1',
    prompt_text TEXT NOT NULL,
    prompt_google_flow TEXT,
    prompt_dreamina TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    is_latest BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Continuity Warnings
CREATE TABLE IF NOT EXISTS continuity_warnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    shot_id UUID REFERENCES shots(id) ON DELETE SET NULL,
    asset_type VARCHAR(50) NOT NULL, -- Character, Location, Prop, Costume
    asset_id UUID NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    conflict_type VARCHAR(100) NOT NULL, -- Hair, Costume, Weather, Lighting, Condition
    locked_value TEXT NOT NULL,
    current_value TEXT NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, OVERRIDDEN, RESOLVED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Production Status History / Metrics
CREATE TABLE IF NOT EXISTS production_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    total_episodes INT DEFAULT 0,
    in_production_episodes INT DEFAULT 0,
    total_scenes INT DEFAULT 0,
    prompts_ready INT DEFAULT 0,
    videos_generated INT DEFAULT 0,
    continuity_warnings_count INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Stories (Round 2 Script & Story Input)
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    logline TEXT,
    screenplay TEXT,
    treatment TEXT,
    active_tab VARCHAR(20) DEFAULT 'SCREENPLAY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_project_story UNIQUE (project_id)
);

-- 20. Shot Takes (Round 2 Video Take Management)
CREATE TABLE IF NOT EXISTS shot_takes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shot_id UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
    take_number INT NOT NULL,
    video_url TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, REVIEW, SELECTED, REJECTED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Audit Logs (Round 2 Audit Trail & History)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- Asset, Shot, Scene, Prompt, Take
    entity_id VARCHAR(100) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROUND 3: DIRECTOR WORKSTATION & PRODUCTION WORKFLOW TABLES
-- ==============================================================================

-- 22. Character States (e.g., NORMAL, INJURED, BLOODIED, EXHAUSTED, WET)
CREATE TABLE IF NOT EXISTS character_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    face_condition TEXT,
    hair_condition TEXT,
    costume_condition TEXT,
    body_condition TEXT,
    accessories TEXT,
    performance TEXT,
    reference_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Scene Character States (Associating a character state with a specific scene)
CREATE TABLE IF NOT EXISTS scene_character_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    state_id UUID NOT NULL REFERENCES character_states(id) ON DELETE CASCADE,
    custom_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_scene_character_state UNIQUE (scene_id, character_id)
);

-- 24. Prop Conditions (e.g., NEW, DAMAGED, BLOODY, BROKEN)
CREATE TABLE IF NOT EXISTS scene_prop_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    prop_id UUID NOT NULL REFERENCES props(id) ON DELETE CASCADE,
    condition VARCHAR(100) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_scene_prop_condition UNIQUE (scene_id, prop_id)
);

-- 25. Scene Script Versions (V1, V2, V3 screenplays)
CREATE TABLE IF NOT EXISTS scene_script_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    version_tag VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Continuity Overrides (Director override log with rationale)
CREATE TABLE IF NOT EXISTS continuity_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    warning_id VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    overridden_by VARCHAR(100) DEFAULT 'Director',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 27. Production Health Snapshots
CREATE TABLE IF NOT EXISTS production_health_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    asset_lock_percentage INT DEFAULT 0,
    shot_ready_percentage INT DEFAULT 0,
    video_completed_percentage INT DEFAULT 0,
    active_warnings_count INT DEFAULT 0,
    critical_warnings_count INT DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. Production Context Snapshots (Immutable Audit & Frozen Reference)
CREATE TABLE IF NOT EXISTS production_context_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shot_id UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
    prompt_version_tag VARCHAR(50) NOT NULL,
    snapshot_json JSONB NOT NULL,
    continuity_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. Story Events & Consequences
CREATE TABLE IF NOT EXISTS story_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    scene_number INT NOT NULL,
    beat_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    characters_affected JSONB DEFAULT '[]'::jsonb,
    props_affected JSONB DEFAULT '[]'::jsonb,
    location_affected VARCHAR(255),
    costume_affected JSONB DEFAULT '[]'::jsonb,
    state_changes JSONB DEFAULT '[]'::jsonb,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. Story Checkpoints (End of Scene State Anchors)
CREATE TABLE IF NOT EXISTS story_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    scene_number INT NOT NULL,
    character_states JSONB DEFAULT '[]'::jsonb,
    costume_states JSONB DEFAULT '[]'::jsonb,
    prop_conditions JSONB DEFAULT '[]'::jsonb,
    location_state JSONB DEFAULT '{}'::jsonb,
    timeline_date VARCHAR(50),
    timeline_time VARCHAR(50),
    important_events JSONB DEFAULT '[]'::jsonb,
    open_conflicts JSONB DEFAULT '[]'::jsonb,
    next_objective TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. Shot Contracts (Must Keep, Must Change, Must Not Change)
CREATE TABLE IF NOT EXISTS shot_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shot_id UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
    must_keep JSONB DEFAULT '[]'::jsonb,
    must_change JSONB DEFAULT '[]'::jsonb,
    must_not_change JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 32. Shot 2D Blocking Diagrams
CREATE TABLE IF NOT EXISTS shot_blocking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shot_id UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    characters JSONB DEFAULT '[]'::jsonb,
    camera JSONB DEFAULT '{}'::jsonb,
    floorplan_type VARCHAR(50) DEFAULT 'Warehouse',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 33. Change Impact Logs (Master Reference Re-selection Auditing)
CREATE TABLE IF NOT EXISTS change_impact_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL,
    asset_id UUID NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    old_version_tag VARCHAR(50) NOT NULL,
    new_version_tag VARCHAR(50) NOT NULL,
    affected_scenes_count INT DEFAULT 0,
    affected_shots_count INT DEFAULT 0,
    affected_reference_packs_count INT DEFAULT 0,
    affected_prompts_count INT DEFAULT 0,
    affected_shot_ids JSONB DEFAULT '[]'::jsonb,
    director_approved BOOLEAN DEFAULT true,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 34. Location States Log
CREATE TABLE IF NOT EXISTS location_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    state VARCHAR(50) NOT NULL,
    scene_id UUID,
    scene_number INT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

