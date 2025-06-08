

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_plan_owner"("pid" "uuid") RETURNS "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT user_id FROM plans WHERE id = pid
$$;


ALTER FUNCTION "public"."get_plan_owner"("pid" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "location" "text" NOT NULL,
    "start" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "category" "text"
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plan_collaborators" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "plan_id" "uuid",
    "collaborator_email" "text" NOT NULL,
    "inserted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."plan_collaborators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "start" timestamp with time zone NOT NULL,
    "end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "location" "text",
    "public_token" "text"
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plan_collaborators"
    ADD CONSTRAINT "plan_collaborators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plan_collaborators"
    ADD CONSTRAINT "plan_collaborators_plan_id_collaborator_email_key" UNIQUE ("plan_id", "collaborator_email");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."plan_collaborators"
    ADD CONSTRAINT "plan_collaborators_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow access by public token" ON "public"."plans" FOR SELECT USING (true);



CREATE POLICY "Allow activities visible on associated plan" ON "public"."activities" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."plans"
  WHERE (("plans"."id" = "activities"."plan_id") AND ("plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow users to view own plans" ON "public"."plans" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Collaborators can edit activities" ON "public"."activities" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."plan_collaborators"
  WHERE (("plan_collaborators"."plan_id" = "activities"."plan_id") AND ("plan_collaborators"."collaborator_email" = ("auth"."jwt"() ->> 'email'::"text")))))));



CREATE POLICY "Collaborators can edit plan" ON "public"."plans" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."plan_collaborators"
  WHERE (("plan_collaborators"."plan_id" = "plans"."id") AND ("plan_collaborators"."collaborator_email" = ("auth"."jwt"() ->> 'email'::"text")))))));



CREATE POLICY "Collaborators can view activities" ON "public"."activities" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."plan_collaborators"
  WHERE (("plan_collaborators"."plan_id" = "activities"."plan_id") AND ("plan_collaborators"."collaborator_email" = ("auth"."jwt"() ->> 'email'::"text")))))));



CREATE POLICY "Collaborators can view/edit plan" ON "public"."plans" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."plan_collaborators"
  WHERE (("plan_collaborators"."plan_id" = "plans"."id") AND ("plan_collaborators"."collaborator_email" = ("auth"."jwt"() ->> 'email'::"text")))))));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."activities" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."plans" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."activities" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable plan insert for authenticated users only" ON "public"."plans" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable update for users on user ID" ON "public"."plans" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Plan owner can add collaborators" ON "public"."plan_collaborators" FOR INSERT WITH CHECK (("auth"."uid"() = "public"."get_plan_owner"("plan_id")));



CREATE POLICY "Plan owner can delete any collaborator" ON "public"."plan_collaborators" FOR DELETE USING (("auth"."uid"() = ( SELECT "plans"."user_id"
   FROM "public"."plans"
  WHERE ("plans"."id" = "plan_collaborators"."plan_id"))));



CREATE POLICY "Plan owner can read collaborator list" ON "public"."plan_collaborators" FOR SELECT USING (("auth"."uid"() = "public"."get_plan_owner"("plan_id")));



CREATE POLICY "Read activities for public plans" ON "public"."activities" FOR SELECT USING (("plan_id" IN ( SELECT "plans"."id"
   FROM "public"."plans"
  WHERE ("plans"."public_token" IS NOT NULL))));



CREATE POLICY "User can read rows where they are collaborators" ON "public"."plan_collaborators" FOR SELECT USING ((("auth"."email"() = "collaborator_email") OR ("auth"."uid"() = "public"."get_plan_owner"("plan_id"))));



CREATE POLICY "User can update their own activities" ON "public"."activities" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plan_collaborators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."activities";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."plan_collaborators";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."plans";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."get_plan_owner"("pid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_plan_owner"("pid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_plan_owner"("pid" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."plan_collaborators" TO "anon";
GRANT ALL ON TABLE "public"."plan_collaborators" TO "authenticated";
GRANT ALL ON TABLE "public"."plan_collaborators" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
