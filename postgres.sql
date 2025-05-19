--Таблица с иерархией папок
CREATE TABLE IF NOT EXISTS dbo.library_folders
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    parent_id integer,
    s_name text COLLATE pg_catalog."default" NOT NULL,
    path text COLLATE pg_catalog."default",
    date_modified timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "max-size" bigint,
    CONSTRAINT library_folders_pkey PRIMARY KEY (id),
    CONSTRAINT library_folders_path_key UNIQUE (path),
    CONSTRAINT library_folders_parent_folder_id_fkey FOREIGN KEY (parent_id)
        REFERENCES dbo.library_folders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

--Таблица с информацией о файлах
CREATE TABLE IF NOT EXISTS dbo.library_files
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    folder_id integer NOT NULL,
    s_name text COLLATE pg_catalog."default" NOT NULL,
    s_note text COLLATE pg_catalog."default",
    size bigint,
    type text COLLATE pg_catalog."default",
    date_modified timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_modified integer,
    CONSTRAINT library_files_pkey PRIMARY KEY (id),
    CONSTRAINT library_files_folder_id_fkey FOREIGN KEY (folder_id)
        REFERENCES dbo.library_folders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

--Функция для получения дерева папок
CREATE OR REPLACE FUNCTION dbo.get_folders_tree(
	_parent_id integer DEFAULT NULL::integer)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'title', lf.s_name,
			'key', lf.id,
            'children', get_folders_tree(lf.id)
        )
    )
    INTO result
    FROM dbo.library_folders lf
	WHERE lf.parent_id is not distinct from _parent_id;
    --ORDER BY lf.name;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$BODY$;

--Функция для получения списка файлов
CREATE OR REPLACE FUNCTION dbo.get_files_by_folder(
	_folder_id integer DEFAULT NULL::integer)
    RETURNS TABLE(id integer, folder_id integer, s_name text, s_note text, size bigint, size_text text, type text, date_modified timestamp without time zone, date_modified_text text, user_modified integer, user_modified_text text) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$

BEGIN

RETURN QUERY

	WITH RECURSIVE r AS 
	(
		SELECT a.id, a.parent_id, a.s_name
		FROM dbo.library_folders a
		WHERE a.id = _folder_id

		UNION

		SELECT lf.id, lf.parent_id, lf.s_name
		FROM dbo.library_folders lf
		INNER JOIN r
		ON lf.parent_id = r.id
	)

	SELECT 
		f.id,
		f.folder_id,
		f.s_name,
		f.s_note,
		f.size,
		case when f.size < 1024*1024 then concat(f.size / 1024, ' Кб') else concat(f.size / 1024 / 1024, ' Мб') end as size_text,
		f.type,
		f.date_modified,
		to_char(f.date_modified, 'DD.MM.YYYY HH24:MM') as date_modified_text,
		f.user_modified,
		u.s_code::text as user_modified_text
	FROM r
	INNER JOIN dbo.library_files f on r.id = f.folder_id
	left join (select d.id, d.s_code from dbo.dict d where id_type = 1003) u on u.id = f.user_modified;

END;
$BODY$;

--Функция для получения информации о свободном\занятом\общем месте в папке
CREATE OR REPLACE FUNCTION dbo.get_folder_info(
	_folder_id integer)
    RETURNS TABLE(folder_id integer, folder_name text, total bigint, used bigint) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    WITH RECURSIVE folder_tree AS (
        -- Базовый случай: начальная папка
        SELECT 
            lf.id,
            lf.s_name,
            lf."max-size",
            0 AS level
        FROM 
            dbo.library_folders lf
        WHERE 
            lf.id = _folder_id
        
        UNION ALL
        
        -- Рекурсивный случай: все подпапки
        SELECT 
            child.id,
            child.s_name,
            child."max-size",
            parent.level + 1
        FROM 
            dbo.library_folders child
        JOIN 
            folder_tree parent ON child.parent_id = parent.id
    )
    SELECT 
        _folder_id AS folder_id,
        (SELECT s_name FROM dbo.library_folders WHERE id = _folder_id) AS folder_name,
        (SELECT "max-size" FROM dbo.library_folders WHERE id = _folder_id) AS total,
        COALESCE(SUM(lf.size), 0)::bigint AS used
    FROM 
        folder_tree ft
    LEFT JOIN 
        dbo.library_files lf ON lf.folder_id = ft.id;
END;
$BODY$;

ALTER FUNCTION dbo.get_folder_info(integer)
    OWNER TO postgres;
