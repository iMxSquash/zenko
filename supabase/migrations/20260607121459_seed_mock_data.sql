-- Données de mock pour la bibliothèque et le forum (dev/preview)

-- Utilisateur de seed servant de référence aux contenus mockés du forum
-- (jamais utilisé pour se connecter — mot de passe non exploitable)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'seed.forum@zenko.local',
  'seed-user-no-login',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

-- Fiches de la bibliothèque
insert into public.fiches (slug, title, description, category, author) values
  ('comprendre-le-tsa', 'Comprendre le TSA au quotidien', 'Repères pour mieux saisir le fonctionnement d''un enfant avec un trouble du spectre de l''autisme.', 'TSA', 'Dr. Amélie Roussel'),
  ('gerer-les-crises-tsa', 'Gérer les moments de crise liés au TSA', 'Stratégies concrètes pour anticiper et apaiser les crises sensorielles.', 'TSA', 'Dr. Amélie Roussel'),
  ('routines-et-tdah', 'Mettre en place des routines avec un enfant TDAH', 'Construire un cadre rassurant qui favorise la concentration et l''autonomie.', 'TDAH', 'Karim Belkacem'),
  ('organisation-tdah-ecole', 'Organiser le travail scolaire avec un enfant TDAH', 'Outils simples pour structurer les devoirs et réduire la charge mentale.', 'TDAH', 'Karim Belkacem'),
  ('lecture-et-dyslexie', 'Accompagner la lecture chez un enfant dyslexique', 'Adapter les supports de lecture pour soutenir la progression sans décourager.', 'DYS', 'Sophie Lambert'),
  ('communication-tdi', 'Favoriser la communication avec un enfant TDI', 'Pistes pour adapter son langage et encourager les échanges au quotidien.', 'TDI', 'Nadia Ferreira')
on conflict (slug) do nothing;

-- Threads du forum
insert into public.forum_threads (id, user_id, title, content, category, author_name, author_role, is_pinned) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Comment gérer les transitions entre activités avec un enfant TSA ?', 'Mon fils a du mal à passer d''une activité à une autre. Quelles routines avez-vous mises en place pour faciliter les transitions ?', 'TSA', 'Camille D.', 'parent', true),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Adaptations en classe pour un élève DYS', 'Je cherche des retours d''expérience sur les aménagements qui fonctionnent vraiment en classe ordinaire.', 'DYS', 'Mehdi T.', 'prof', false),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Outils pour structurer les devoirs avec un enfant TDAH', 'Quels outils visuels ou applications utilisez-vous pour aider à la planification des devoirs ?', 'TDAH', 'Laura B.', 'parent', false)
on conflict (id) do nothing;

-- Réponses du forum
insert into public.forum_replies (id, thread_id, user_id, author_name, author_role, content) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Sophie Lambert', 'expert', 'Un timer visuel quelques minutes avant la transition aide beaucoup à anticiper le changement.'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Camille D.', 'parent', 'Merci pour le conseil, on va essayer avec un sablier à la maison !'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Nadia Ferreira', 'expert', 'Le tiers temps et les supports en police adaptée font souvent une vraie différence.'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Karim Belkacem', 'expert', 'Un tableau de tâches avec des cases à cocher fonctionne bien pour visualiser la progression.')
on conflict (id) do nothing;
