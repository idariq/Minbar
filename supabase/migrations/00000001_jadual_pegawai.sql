-- Jadual Pegawai — jadual pegawai bertugas (Imam/Bilal setiap waktu solat),
-- gantikan penyelenggaraan manual dalam Excel. Ikut corak tepat skema Biro
-- Pendidikan (00000000_skema_asas.sql): satu baris jsonb per bulan.

create table public.pegawai_bulan (
  id            uuid primary key default gen_random_uuid(),
  bulan         text not null unique,
  label         text not null,
  data          jsonb not null default '{}',
  dikemas_pada  timestamptz default now()
);

create table public.pegawai_senarai (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null unique,
  jenis         text not null default 'tetap' check (jenis in ('tetap', 'rizab')),
  aktif         boolean default true,
  dicipta_pada  timestamptz not null default now()
);

do $$
declare
  t text;
  jadual text[] := array['pegawai_bulan', 'pegawai_senarai'];
begin
  foreach t in array jadual loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "admin_penuh" on public.%I for all to authenticated using (true) with check (true)',
      t
    );
    execute format('grant all on table public.%I to authenticated, service_role', t);
  end loop;
end $$;
