ogr2ogr \
-f GeoJSON \
-where "(subregion IN ('Eastern Europe', 'Northern Europe', \
'Southern Europe', 'Western Europe') AND gu_a3 NOT IN ('GUF')) \
OR gu_a3 IN ('ISR', 'KAZ', 'GEO', 'ARM', 'AZE', 'TUR', 'CYP')" \
countries.json \
ne_110m_admin_0_map_units/ne_110m_admin_0_map_units.shp

topojson \
-o europe.json \
countries.json

rm countries.json


ogr2ogr \
-f GeoJSON \
-where "subregion IN ('Caribbean', 'Central America', 'Northern America')" \
countries.json \
ne_110m_admin_0_map_units/ne_110m_admin_0_map_units.shp

# redo north america manually by cutting and pasting these commands. after ogr2ogr 
# go in and delete the hawaiian islands, then make northernamericas.json with topojson
# the islands are easy to find- they are the first objects in the USA section,
# with lat/long about -157/21
# 
topojson \
-o northernamericas.json \
countries.json
#
rm countries.json



ogr2ogr \
-f GeoJSON \
-where "subregion IN ('South America') OR gu_a3 IN ('GUF')" \
countries.json \
ne_110m_admin_0_map_units/ne_110m_admin_0_map_units.shp

topojson \
-o southamerica.json \
countries.json

rm countries.json



ogr2ogr \
-f GeoJSON \
-where "subregion IN ('Eastern Asia', 'South-Eastern Asia', 'Southern Asia', 'Western Asia', \
'Central Asia') AND gu_a3 NOT IN ('ISR', 'KAZ', 'GEO', 'ARM', 'AZE', 'TUR', 'CYP')" \
countries.json \
ne_110m_admin_0_map_units/ne_110m_admin_0_map_units.shp

topojson \
-o asia.json \
countries.json

rm countries.json



ogr2ogr \
-f GeoJSON \
-where "subregion IN ('Australia and New Zealand', 'Melanesia', 'Micronesia', 'Polynesia')" \
countries.json \
ne_110m_admin_0_map_units/ne_110m_admin_0_map_units.shp

topojson \
-o oceania.json \
countries.json

rm countries.json




ogr2ogr \
-f GeoJSON \
-where "subregion IN ('Eastern Africa', 'Middle Africa', 'Southern Africa', 'Western Africa', 'Northern Africa')" \
countries.json \
ne_110m_admin_0_map_units/ne_110m_admin_0_map_units.shp

topojson \
-o africa.json \
countries.json

rm countries.json



ogr2ogr \
-f GeoJSON \
-where "subregion IN ('Antarctica')" \
countries.json \
ne_110m_admin_0_map_units/ne_110m_admin_0_map_units.shp

topojson \
-o antarctica.json \
countries.json

rm countries.json



ogr2ogr \
-f GeoJSON \
-where "iso_3166_2 IN ('US-HI')" \
countries.json \
ne_110m_admin_1_states_provinces/ne_110m_admin_1_states_provinces_shp.shp

topojson \
-o hawaii.json \
countries.json

rm countries.json
