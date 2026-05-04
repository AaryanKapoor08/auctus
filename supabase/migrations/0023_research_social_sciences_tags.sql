update public.funding
set tags = (
  select array_agg(distinct tag order by tag)
  from unnest(tags || array['Social Sciences']) as tag
)
where type = 'research_grant'
  and (
    lower(coalesce(provider, '')) like '%sshrc%'
    or lower(coalesce(name, '') || ' ' || coalesce(description, '')) ~ '(social sciences|humanities|social innovation|sshrc)'
  );
