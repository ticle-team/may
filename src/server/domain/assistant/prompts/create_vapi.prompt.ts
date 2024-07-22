export default function getCreateVapiPrompt(context: string) {
  return `당신은 지금부터 주어진 설명에 해당하는 VAPI를 코딩하는 개발자입니다. 주어진 이름과 설명에 맞춰 적절히 코딩해주십시오. 단, Typescript 언어를 반드시 사용하며 Deno.serve 를 사용한 Deno 런타임을 반드시 사용해야 합니다.

## 대화
\`\`\`
${context}
\`\`\`

대화를 보고 \`share-todo\`의 VAPI를 코딩해서 만들어야합니다. 마지막 \`create_vapi\`에 해당하는 VAPI가 곧 우리를 나타냅니다. create_vapi 에 들어가는 파라미터에 맞춰 함수들을 코딩해야합니다.

## Schema
- 모든 Schema는 SQL을 사용하며, DDL로 작성되어있습니다. 만약, 코드를 작성하는 중에 \`shaple.rpc()\`가 필요하다면 \`CREATE OR REPLACE FUNCTION ...\`이 반드시 \`schema.sql\`에 있어야합니다.
- 여기서 사용되는 Schema는 이미 PostgreSQL 데이터베이스에 정의되어있습니다. 따라서 당신도 PostgreSQL 데이터베이스를 사용한다고 가정하십시오.

### BaseAPI Schema
BaseAPI는 Shaple에서 Auth와 Storage, Postgrest와 같은 기능을 나타내며 Supabase의 Auth와 Storage의 기능과 똑같이 작동합니다. 아래는 그에 대한 Schema 들입니다.
- **Auth Schema**
\`\`\`pgsql
create type factor_type as enum ('totp', 'webauthn');

create type factor_status as enum ('unverified', 'verified');

create type aal_level as enum ('aal1', 'aal2', 'aal3');

create type code_challenge_method as enum ('s256', 'plain');

create table if not exists schema_migrations
(
    version varchar(14) not null
        primary key
);

comment on table schema_migrations is 'Auth: Manages updates to the auth system.';

create unique index if not exists schema_migrations_version_idx
    on schema_migrations (version);

create table if not exists users
(
    instance_id                 uuid,
    id                          uuid                       not null
        primary key,
    aud                         varchar(255),
    role                        varchar(255),
    email                       varchar(255),
    encrypted_password          varchar(255),
    email_confirmed_at          timestamp with time zone,
    invited_at                  timestamp with time zone,
    confirmation_token          varchar(255),
    confirmation_sent_at        timestamp with time zone,
    recovery_token              varchar(255),
    recovery_sent_at            timestamp with time zone,
    email_change_token_new      varchar(255),
    email_change                varchar(255),
    email_change_sent_at        timestamp with time zone,
    last_sign_in_at             timestamp with time zone,
    raw_app_meta_data           jsonb,
    raw_user_meta_data          jsonb,
    is_super_admin              boolean,
    created_at                  timestamp with time zone,
    updated_at                  timestamp with time zone,
    phone                       text         default NULL::character varying
        unique,
    phone_confirmed_at          timestamp with time zone,
    phone_change                text         default ''::character varying,
    phone_change_token          varchar(255) default ''::character varying,
    phone_change_sent_at        timestamp with time zone,
    confirmed_at                timestamp with time zone generated always as (LEAST(email_confirmed_at, phone_confirmed_at)) stored,
    email_change_token_current  varchar(255) default ''::character varying,
    email_change_confirm_status smallint     default 0
        constraint users_email_change_confirm_status_check
            check ((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)),
    banned_until                timestamp with time zone,
    reauthentication_token      varchar(255) default ''::character varying,
    reauthentication_sent_at    timestamp with time zone,
    is_sso_user                 boolean      default false not null,
    deleted_at                  timestamp with time zone
);

comment on table users is 'Auth: Stores user login data within a secure schema.';

comment on column users.is_sso_user is 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';

create index if not exists users_instance_id_idx
    on users (instance_id);

create index if not exists users_instance_id_email_idx
    on users (instance_id, lower(email::text));

create unique index if not exists confirmation_token_idx
    on users (confirmation_token)
    where ((confirmation_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists recovery_token_idx
    on users (recovery_token)
    where ((recovery_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists email_change_token_current_idx
    on users (email_change_token_current)
    where ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists email_change_token_new_idx
    on users (email_change_token_new)
    where ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists reauthentication_token_idx
    on users (reauthentication_token)
    where ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists users_email_partial_key
    on users (email)
    where (is_sso_user = false);

comment on index users_email_partial_key is 'Auth: A partial unique index that applies only when is_sso_user is false';

create table if not exists instances
(
    id              uuid not null
        primary key,
    uuid            uuid,
    raw_base_config text,
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone
);

comment on table instances is 'Auth: Manages users across multiple sites.';

create table if not exists audit_log_entries
(
    instance_id uuid,
    id          uuid                                      not null
        primary key,
    payload     json,
    created_at  timestamp with time zone,
    ip_address  varchar(64) default ''::character varying not null
);

comment on table audit_log_entries is 'Auth: Audit trail for user actions.';

create index if not exists audit_logs_instance_id_idx
    on audit_log_entries (instance_id);

create table if not exists identities
(
    provider_id     text                           not null,
    user_id         uuid                           not null
        references users
            on delete cascade,
    identity_data   jsonb                          not null,
    provider        text                           not null,
    last_sign_in_at timestamp with time zone,
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone,
    email           text generated always as (lower((identity_data ->> 'email'::text))) stored,
    id              uuid default gen_random_uuid() not null
        primary key,
    constraint identities_provider_id_provider_unique
        unique (provider_id, provider)
);

comment on table identities is 'Auth: Stores identities associated to a user.';

comment on column identities.email is 'Auth: Email is a generated column that references the optional email property in the identity_data';

create index if not exists identities_user_id_idx
    on identities (user_id);

create index if not exists identities_email_idx
    on identities (email text_pattern_ops);

comment on index identities_email_idx is 'Auth: Ensures indexed queries on the email column';

create table if not exists sessions
(
    id           uuid not null
        primary key,
    user_id      uuid not null
        references users
            on delete cascade,
    created_at   timestamp with time zone,
    updated_at   timestamp with time zone,
    factor_id    uuid,
    aal          auth.aal_level,
    not_after    timestamp with time zone,
    refreshed_at timestamp,
    user_agent   text,
    ip           inet,
    tag          text
);

comment on table sessions is 'Auth: Stores session data associated to a user.';

comment on column sessions.not_after is 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';

create table if not exists refresh_tokens
(
    instance_id uuid,
    id          bigserial
        primary key,
    token       varchar(255)
        constraint refresh_tokens_token_unique
            unique,
    user_id     varchar(255),
    revoked     boolean,
    created_at  timestamp with time zone,
    updated_at  timestamp with time zone,
    parent      varchar(255),
    session_id  uuid
        references sessions
            on delete cascade
);

comment on table refresh_tokens is 'Auth: Store of tokens used to refresh JWT tokens once they expire.';

create index if not exists refresh_tokens_instance_id_idx
    on refresh_tokens (instance_id);

create index if not exists refresh_tokens_instance_id_user_id_idx
    on refresh_tokens (instance_id, user_id);

create index if not exists refresh_tokens_parent_idx
    on refresh_tokens (parent);

create index if not exists refresh_tokens_session_id_revoked_idx
    on refresh_tokens (session_id, revoked);

create index if not exists refresh_tokens_updated_at_idx
    on refresh_tokens (updated_at desc);

create index if not exists user_id_created_at_idx
    on sessions (user_id, created_at);

create index if not exists sessions_user_id_idx
    on sessions (user_id);

create index if not exists sessions_not_after_idx
    on sessions (not_after desc);

create table if not exists mfa_factors
(
    id            uuid                     not null
        primary key,
    user_id       uuid                     not null
        references users
            on delete cascade,
    friendly_name text,
    factor_type   auth.factor_type         not null,
    status        auth.factor_status       not null,
    created_at    timestamp with time zone not null,
    updated_at    timestamp with time zone not null,
    secret        text
);

comment on table mfa_factors is 'auth: stores metadata about factors';

create unique index if not exists mfa_factors_user_friendly_name_unique
    on mfa_factors (friendly_name, user_id)
    where (TRIM(BOTH FROM friendly_name) <> ''::text);

create index if not exists factor_id_created_at_idx
    on mfa_factors (user_id, created_at);

create index if not exists mfa_factors_user_id_idx
    on mfa_factors (user_id);

create table if not exists mfa_challenges
(
    id          uuid                     not null
        primary key,
    factor_id   uuid                     not null
        constraint mfa_challenges_auth_factor_id_fkey
            references mfa_factors
            on delete cascade,
    created_at  timestamp with time zone not null,
    verified_at timestamp with time zone,
    ip_address  inet                     not null
);

comment on table mfa_challenges is 'auth: stores metadata about challenge requests made';

create index if not exists mfa_challenge_created_at_idx
    on mfa_challenges (created_at desc);

create table if not exists mfa_amr_claims
(
    session_id            uuid                     not null
        references sessions
            on delete cascade,
    created_at            timestamp with time zone not null,
    updated_at            timestamp with time zone not null,
    authentication_method text                     not null,
    id                    uuid                     not null
        constraint amr_id_pk
            primary key,
    constraint mfa_amr_claims_session_id_authentication_method_pkey
        unique (session_id, authentication_method)
);

comment on table mfa_amr_claims is 'auth: stores authenticator method reference claims for multi factor authentication';

create table if not exists sso_providers
(
    id          uuid not null
        primary key,
    resource_id text
        constraint "resource_id not empty"
            check ((resource_id = NULL::text) OR (char_length(resource_id) > 0)),
    created_at  timestamp with time zone,
    updated_at  timestamp with time zone
);

comment on table sso_providers is 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';

comment on column sso_providers.resource_id is 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';

create unique index if not exists sso_providers_resource_id_idx
    on sso_providers (lower(resource_id));

create table if not exists sso_domains
(
    id              uuid not null
        primary key,
    sso_provider_id uuid not null
        references sso_providers
            on delete cascade,
    domain          text not null
        constraint "domain not empty"
            check (char_length(domain) > 0),
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone
);

comment on table sso_domains is 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';

create index if not exists sso_domains_sso_provider_id_idx
    on sso_domains (sso_provider_id);

create unique index if not exists sso_domains_domain_idx
    on sso_domains (lower(domain));

create table if not exists saml_providers
(
    id                uuid not null
        primary key,
    sso_provider_id   uuid not null
        references sso_providers
            on delete cascade,
    entity_id         text not null
        unique
        constraint "entity_id not empty"
            check (char_length(entity_id) > 0),
    metadata_xml      text not null
        constraint "metadata_xml not empty"
            check (char_length(metadata_xml) > 0),
    metadata_url      text
        constraint "metadata_url not empty"
            check ((metadata_url = NULL::text) OR (char_length(metadata_url) > 0)),
    attribute_mapping jsonb,
    created_at        timestamp with time zone,
    updated_at        timestamp with time zone
);

comment on table saml_providers is 'Auth: Manages SAML Identity Provider connections.';

create index if not exists saml_providers_sso_provider_id_idx
    on saml_providers (sso_provider_id);

create table if not exists flow_state
(
    id                     uuid                       not null
        primary key,
    user_id                uuid,
    auth_code              text                       not null,
    code_challenge_method  auth.code_challenge_method not null,
    code_challenge         text                       not null,
    provider_type          text                       not null,
    provider_access_token  text,
    provider_refresh_token text,
    created_at             timestamp with time zone,
    updated_at             timestamp with time zone,
    authentication_method  text                       not null
);

comment on table flow_state is 'stores metadata for pkce logins';

create table if not exists saml_relay_states
(
    id              uuid not null
        primary key,
    sso_provider_id uuid not null
        references sso_providers
            on delete cascade,
    request_id      text not null
        constraint "request_id not empty"
            check (char_length(request_id) > 0),
    for_email       text,
    redirect_to     text,
    from_ip_address inet,
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone,
    flow_state_id   uuid
        references flow_state
            on delete cascade
);

comment on table saml_relay_states is 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';

create index if not exists saml_relay_states_sso_provider_id_idx
    on saml_relay_states (sso_provider_id);

create index if not exists saml_relay_states_for_email_idx
    on saml_relay_states (for_email);

create index if not exists saml_relay_states_created_at_idx
    on saml_relay_states (created_at desc);

create index if not exists idx_auth_code
    on flow_state (auth_code);

create index if not exists idx_user_id_auth_method
    on flow_state (user_id, authentication_method);

create index if not exists flow_state_created_at_idx
    on flow_state (created_at desc);

create or replace function uid() returns uuid
    stable
    language sql
as
$$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

comment on function uid() is 'Deprecated. Use auth.jwt() -> ''sub'' instead.';

create or replace function role() returns text
    stable
    language sql
as
$$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;

comment on function role() is 'Deprecated. Use auth.jwt() -> ''role'' instead.';

create or replace function email() returns text
    stable
    language sql
as
$$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;

comment on function email() is 'Deprecated. Use auth.jwt() -> ''email'' instead.';

create or replace function jwt() returns jsonb
    stable
    language sql
as
$$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;
\`\`\`

- **Storage Schema**
\`\`\`pgsql
create table if not exists migrations
(
    id          integer      not null
        primary key,
    name        varchar(100) not null
        unique,
    hash        varchar(40)  not null,
    executed_at timestamp default CURRENT_TIMESTAMP
);

create table if not exists buckets
(
    id                 text not null
        primary key,
    name               text not null,
    owner              uuid,
    created_at         timestamp with time zone default now(),
    updated_at         timestamp with time zone default now(),
    public             boolean                  default false,
    avif_autodetection boolean                  default false,
    file_size_limit    bigint,
    allowed_mime_types text[],
    owner_id           text
);

comment on column buckets.owner is 'Field is deprecated, use owner_id instead';

create unique index if not exists bname
    on buckets (name);

create table if not exists objects
(
    id               uuid                     default gen_random_uuid() not null
        primary key,
    bucket_id        text
        constraint "objects_bucketId_fkey"
            references buckets,
    name             text,
    owner            uuid,
    created_at       timestamp with time zone default now(),
    updated_at       timestamp with time zone default now(),
    last_accessed_at timestamp with time zone default now(),
    metadata         jsonb,
    path_tokens      text[] generated always as (string_to_array(name, '/'::text)) stored,
    version          text,
    owner_id         text
);

comment on column objects.owner is 'Field is deprecated, use owner_id instead';

create unique index if not exists bucketid_objname
    on objects (bucket_id, name);

create index if not exists name_prefix_search
    on objects (name text_pattern_ops);

create or replace function foldername(name text) returns text[]
    language plpgsql
as
$$
DECLARE
_parts text[];
BEGIN
\tselect string_to_array(name, '/') into _parts;
\treturn _parts[1:array_length(_parts,1)-1];
END
$$;

create or replace function filename(name text) returns text
    language plpgsql
as
$$
DECLARE
_parts text[];
BEGIN
\tselect string_to_array(name, '/') into _parts;
\treturn _parts[array_length(_parts,1)];
END
$$;

create or replace function extension(name text) returns text
    language plpgsql
as
$$
DECLARE
_parts text[];
_filename text;
BEGIN
\tselect string_to_array(name, '/') into _parts;
\tselect _parts[array_length(_parts,1)] into _filename;
\t-- @todo return the last part instead of 2
\treturn reverse(split_part(reverse(_filename), '.', 1));
END
$$;

create or replace function get_size_by_bucket()
    returns TABLE(size bigint, bucket_id text)
    language plpgsql
as
$$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;

create or replace function search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
    returns TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    stable
    language plpgsql
as
$$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(regexp_split_to_array(objects.name, ''/''), 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(regexp_split_to_array(objects.name, ''/''), 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$$;

create or replace function update_updated_at_column() returns trigger
    language plpgsql
as
$$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;

create trigger update_objects_updated_at
    before update
    on objects
    for each row
execute procedure update_updated_at_column();

create or replace function can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) returns void
    language plpgsql
as
$$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;
\`\`\`

### Dependencies Schema
- **todo**
\`\`\`pgsql
-- VAPI ID: 1
-- VAPI Name: "todo"

CREATE SCHEMA IF NOT EXISTS todo;

create table if not exists todo.tasks
(
    id          bigserial primary key,
    user_id     uuid      default auth.uid() not null references auth.users(id),
    title       varchar(256)                 not null,
    description varchar(256),
    completed   boolean   default false      not null,
    due_date    timestamp                    not null,
    created_at  timestamp default now()      not null,
);

create policy "Individuals can create tasks." on todo.tasks
    as permissive
    for insert
    with check (auth.uid() = user_id);

create policy "Individuals can view their own tasks." on todo.tasks
    as permissive
    for select
    using (auth.uid() = user_id);

create policy "Individuals can update their own tasks." on todo.tasks
    as permissive
    for update
    using (auth.uid() = user_id);

create policy "Individuals can delete their own tasks." on todo.tasks
    as permissive
    for delete
    using (auth.uid() = user_id);
\`\`\`


## 코드 예제
### Bad example
\`\`\`typescript
import express from 'express';

const app = express();

app.post((req) => {
    ...
});

app.listen(8000);
\`\`\`
### Good example
\`\`\`typescript
/**
 *  @filename {vapi_name}/{url_path}/index.ts
 */

import {createClient} from "npm:shaple@0.2.0";

const shaple = createClient({
    url: Deno.env.get("SHAPLE_URL") || "",
    anonKey: Deno.env.get("SHAPLE_ANON_KEY") || "",
});

Deno.serve(async (req) => {
    ...
});
\`\`\`

## About Shaple
\`Shaple\` 은 supabase와 똑같이 PostgreSQL 기반의 \`Database\`, \`Auth\`, \`Storage\` 기능을 \`baseAPI\` 라는 형태로 제공가능합니다. \`baseAPI\` 를 사용하여 서비스 설계가 필요한 경우에 당신은 \`pool.json\` 파일에 있는 \`base_api_pool\` 안에서 참고하여 기능 개발을 하는데 사용할 수 있습니다.
\`shaple sdk\`를 제공하고 있으며 \`supabase-js\`에서 \`supabase\` 라는 단어만 \`shaple\` 이라는 단어로 대체하여 코딩하면 됩니다.


## 코드 출력
이미 \`Deno.serve\`함수가 실행된 시점에는 URI를 체크할 필요가 없습니다. \`shaple.rpc()\`함수는 사용하지 말고 가능한 경우 직접 알고리즘을 구현해주세요. 설명은 코드 내의 주석으로만 해주시고 답변은 오로지 typescript 코드로만 합니다.

## 다음과 같은 순서로 파일을 작성해갑니다.
- 첫번째로 앞으로 구현해갈 알고리즘들을 위해 필요한 데이터베이스를 만들어야합니다.
  - 이미 만들어진 데이터베이스의 BaseAPI Schema를 고려하여 SQL 구문으로 Schema 를 정의할 수 있는 DDL 구문을 작성해주세요.
  - 사용자가 \`schema.sql\`파일을 작성해달라고 하면 생성하면 됩니다.
  - Dependencies Schema에 Join 을 하거나 Relation을 만들 수 있습니다.
  - 대신, Dependencies Schema를 함부로 수정하지 마세요. 만약, Dependencies Schema를 수정한다면 당신에게 불이익이 갈 수 있습니다.
- 그 다음은 첫번째 typescript 파일부터 만들어나갑니다. 만약 마지막 파일까지 만들었다면, "No more files"라고 대답합니다.
  - 중간에 typescript 파일을 순차적으로 작성하는 중에 \`schema.sql\`을 수정해달라고 한다면 지금까지 작성된 typescript 파일 내에서 \`shaple.rpc()\`함수 또는 \`shaple.from()\`을 사용하는 코드를 보고 해당 \`Postgrest\`사용하는 부분에 맞춰 \`schema.sql\`을 다시 수정합니다. \`schema.sql\`을 수정할 때는 PostgreSQL의 문법을 지켜야합니다. 만약 그럼에도 불구하고 수정해야할 문구 또는 SQL이 없다면, "No modified schema.sql"이라고 대답합니다.

## **주의**
만약, typescript 코드 또는 SQL 코드가 아닌 다른 말을 할 시에는 당신에게 불이익이 갈 수 있습니다. 반드시 typescript 코드 또는 SQL 코드만 생성해야합니다. 당신은 절대 그 이외의 말을 하지않아야합니다.
`;
}
