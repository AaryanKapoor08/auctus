with classified as (
  select
    f.id,
    f.type,
    lower(
      coalesce(f.name, '') || ' ' ||
      coalesce(f.description, '') || ' ' ||
      coalesce(f.provider, '') || ' ' ||
      coalesce(f.category, '') || ' ' ||
      coalesce(f.scraped_from, '') || ' ' ||
      array_to_string(coalesce(f.tags, '{}'), ' ') || ' ' ||
      array_to_string(coalesce(f.requirements, '{}'), ' ')
    ) as t,
    lower(coalesce(f.provider, '')) as provider,
    lower(coalesce(f.scraped_from, '')) as scraped_from
  from public.funding f
),
tagged as (
  select
    c.id,
    c.type,
    array_remove(array[
      case when c.type = 'business_grant' then 'Business' end,
      case when c.type = 'scholarship' then 'Student' end,
      case when c.type = 'scholarship' then 'Scholarship' end,
      case when c.type = 'research_grant' then 'Professor' end,
      case when c.type = 'research_grant' then 'Research' end,
      case when c.type in ('business_grant', 'research_grant') then 'Federal' end,

      case
        when c.type = 'business_grant'
          and c.t ~ '(new brunswick|nova scotia|prince edward island|newfoundland|labrador|atlantic|regional|province|provincial|toronto|vancouver|calgary|edmonton|winnipeg|halifax|fredericton|moncton)'
          then 'Provincial'
      end,
      case when c.type = 'business_grant' and c.t ~ '(startup|start-up|start up|new venture|early validation|accelerator|incubator|elevateip)' then 'Startup' end,
      case when c.type = 'business_grant' and c.t ~ '(growth|scale|scaling|expand|expansion|commercializ|market trend|business data|cluster|strategic response)' then 'Growth' end,
      case when c.type = 'business_grant' and c.t ~ '(loan|financ|capital|credit|bdc|small business financing|offset cost|up to \$|funding)' then 'Financing' end,
      case when c.type = 'business_grant' and c.t ~ '(export|trade|tariff|cusma|united states|market expansion|international)' then 'Export' end,
      case when c.type = 'business_grant' and c.t ~ '(digital|software|ecommerce|e-commerce|technology|ai|compute|data|intellectual property|ip\y)' then 'Digital' end,
      case when c.type = 'business_grant' and c.t ~ '(innovative|innovation|r&d|research|develop|prototype|commercializ|cutting-edge|clusters?|ai|quantum)' then 'Innovation' end,
      case when c.type = 'business_grant' and c.t ~ '(equipment|leasehold|facility|facilities|intellectual property|ip\y)' then 'Equipment' end,
      case when c.type = 'business_grant' and c.t ~ '(clean|energy|environment|sustainab|green|climate|efficiency)' then 'Sustainability' end,
      case when c.type = 'business_grant' and c.t ~ '(mentor|training|network|knowledge hub|resources|support network|guidance|advisory|app|newsletter|finder)' then 'Advisory' end,
      case when c.type = 'business_grant' and c.t ~ '(indigenous|aboriginal|first nations|metis|m.tis|inuit)' then 'Indigenous' end,
      case when c.type = 'business_grant' and c.t ~ '(women|woman|female)' then 'Women' end,
      case when c.type = 'business_grant' and c.t ~ '(black entrepreneur)' then 'Black Entrepreneurs' end,
      case when c.type = 'business_grant' and c.t ~ '(2slgbtqi\+|lgbtq)' then '2SLGBTQI+' end,

      case when c.type = 'scholarship' and (c.scraped_from like '%educanada%' or c.t ~ '(international|foreign|non-canadian|non canadian|global affairs)') then 'International' end,
      case when c.type = 'scholarship' and (c.scraped_from like '%sac-isc%' or c.t ~ '(indigenous|aboriginal|first nations|metis|m.tis|inuit|native|indspire|dene|cree|ojibw|anishinaabe|wsanec|nuu-chah-nulth)') then 'Indigenous' end,
      case when c.type = 'scholarship' and (c.scraped_from like '%educanada%' or c.scraped_from like '%sac-isc%') then 'Federal' end,
      case
        when c.type = 'scholarship'
          and c.t ~ '(new brunswick|nova scotia|prince edward island|newfoundland|labrador|quebec|ontario|manitoba|saskatchewan|alberta|british columbia|yukon|northwest territories|nunavut|provincial|territorial|regina|winnipeg|york|calgary|toronto|vancouver)'
          then 'Provincial'
      end,
      case when c.type = 'scholarship' and c.t ~ '(bursary|bursaries|financial need|in need|need-based|support program|student financial support)' then 'Need-based' end,
      case when c.type = 'scholarship' and c.t ~ '(scholarship|award|prize|excellence|merit|leadership|fellowship)' then 'Merit-based' end,
      case when c.type = 'scholarship' and c.t ~ '(essay|prize|competition)' then 'Essay / Prize' end,
      case when c.type = 'scholarship' and c.t ~ '(entrance|first year|1st year)' then 'Entrance' end,
      case when c.type = 'scholarship' and c.t ~ '(graduate|master|master''s|masters|doctoral|doctorate|phd|postgraduate|research training)' then 'Graduate' end,
      case when c.type = 'scholarship' and c.t ~ '(undergraduate|bachelor|college|university|diploma)' then 'Undergraduate' end,
      case when c.type = 'scholarship' and c.t ~ '(science|technology|engineering|math|mathematics|computer|data|artificial intelligence|ai\y|stem|physics|chemistry|biology|geology|geomatics|forestry|environment|energy)' then 'STEM' end,
      case when c.type = 'scholarship' and c.t ~ '(health|nursing|nurse|medicine|medical|dental|kinesiology|pharmacy|therapy|psychology|social work|helping professions|cancer)' then 'Health' end,
      case when c.type = 'scholarship' and c.t ~ '(trade|trades|apprentice|apprenticeship|journey|carpentry|welding)' then 'Trades' end,
      case when c.type = 'scholarship' and c.t ~ '(business|commerce|accounting|finance|administration|mba|entrepreneur)' then 'Business' end,
      case when c.type = 'scholarship' and c.t ~ '(art|arts|humanities|music|design|history|political science|native studies|literature|creative|communications|architecture|fine arts)' then 'Arts' end,
      case when c.type = 'scholarship' and c.t ~ '(education|teacher|teaching|school board)' then 'Education' end,
      case when c.type = 'scholarship' and c.t ~ '(law|legal|political|policy|social sciences|sociology|social work|community)' then 'Law / Social Sciences' end,
      case when c.type = 'scholarship' and c.t ~ '(environment|forestry|fish|wildlife|conservation|energy|geomatics|ocean)' then 'Environment' end,
      case when c.type = 'scholarship' and c.t ~ '(athletic|athlete|sports?|soccer|hockey)' then 'Athletics' end,
      case when c.type = 'scholarship' and c.t ~ '(women|woman|female|girls)' then 'Women' end,

      case when c.type = 'research_grant' and (c.provider like '%nserc%' or c.t ~ '(nserc|natural sciences|engineering)') then 'NSERC' end,
      case when c.type = 'research_grant' and (c.provider like '%sshrc%' or c.t ~ '(sshrc|social sciences|humanities|social innovation)') then 'SSHRC' end,
      case when c.type = 'research_grant' and (c.provider like '%nserc%' or c.t ~ '(nserc|natural sciences|engineering|quantum)') then 'STEM' end,
      case when c.type = 'research_grant' and c.t ~ '(quantum)' then 'Quantum' end,
      case when c.type = 'research_grant' and c.t ~ '(environment|ocean|biodiversity|ecosystem|forest|climate|sustainab)' then 'Environment' end,
      case when c.type = 'research_grant' and c.t ~ '(discovery)' then 'Discovery' end,
      case when c.type = 'research_grant' and c.t ~ '(alliance|partner|partnership|industry|collaboration|collaborative|community)' then 'Partnership' end,
      case when c.type = 'research_grant' and c.t ~ '(international|global|g7|belmont)' then 'International' end,
      case when c.type = 'research_grant' and c.t ~ '(applied research|college|community)' then 'Applied Research' end,
      case when c.type = 'research_grant' and c.t ~ '(equipment|instrument|tools|facilities|facility)' then 'Equipment' end,
      case when c.type = 'research_grant' and c.t ~ '(graduate|doctoral|master|postdoctoral|fellowship|training|trainee|travel supplement|award)' then 'Training' end,
      case when c.type = 'research_grant' and c.t ~ '(women|equity|diversity|inclusion|dimensions)' then 'Equity / Diversity' end,
      case when c.type = 'research_grant' and c.t ~ '(interdisciplinary|transdisciplinary|catalyst|team)' then 'Interdisciplinary' end
    ], null) as tags
  from classified c
),
deduped as (
  select
    t.id,
    t.type,
    (
      select array_agg(distinct tag order by tag)
      from unnest(t.tags) as tag
    ) as tags
  from tagged t
),
categorized as (
  select
    d.id,
    d.tags,
    coalesce(
      (
        select tag
        from unnest(
          case d.type
            when 'business_grant' then array[
              'Startup', 'Growth', 'Financing', 'Export', 'Digital', 'Innovation',
              'Equipment', 'Sustainability', 'Advisory', 'Indigenous', 'Women'
            ]
            when 'scholarship' then array[
              'Indigenous', 'International', 'Need-based', 'Merit-based', 'Graduate',
              'Undergraduate', 'STEM', 'Health', 'Trades', 'Business', 'Arts', 'Education'
            ]
            else array[
              'NSERC', 'SSHRC', 'Discovery', 'Partnership', 'International',
              'Applied Research', 'Equipment', 'Training', 'Social Sciences', 'STEM'
            ]
          end
        ) as tag
        where tag = any(d.tags)
        limit 1
      ),
      d.tags[1]
    ) as category
  from deduped d
)
update public.funding f
set
  tags = c.tags,
  category = c.category
from categorized c
where f.id = c.id;
