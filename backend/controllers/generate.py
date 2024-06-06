import geopandas as gpd
from shapely.geometry import Point, LineString
import csv

# Define los puntos inicial, final e intermedios
points = [
    Point(-5.640845094452749, 40.83930119846215),
    Point(-5.641278893935165, 40.83905022950579),
    Point(-5.642223045749834, 40.837969121600324),
    Point(-5.643345820880792, 40.83694591394929),
    Point(-5.64446859601175, 40.83638603892682),
    Point(-5.644761280058293, 40.83609644654259),
    Point(-5.645067491457645, 40.835874424857934),
    Point(-5.645769225914494, 40.834870491436),
    Point(-5.646283357449415, 40.83431594917889),
    Point(-5.64901447326045, 40.8311474364745),
]

# Crea una línea que pasa por los puntos dados
road_line = LineString(points)

# Define el número de puntos que deseas generar
num_points = 3391

# Genera puntos a lo largo de la línea
road_points = [road_line.interpolate(i / (num_points + 1), normalized=True) for i in range(num_points)]

# Crea un GeoDataFrame con los puntos
gdf = gpd.GeoDataFrame(geometry=road_points)

# Extrae las coordenadas de los puntos y guárdalas en un archivo CSV
csv_file = 'road_points_updated.csv'
with open(csv_file, 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['latitude', 'longitude'])
    for point in road_points:
        writer.writerow([point.y, point.x])

print(f"Se generaron {num_points} puntos y se guardaron en {csv_file}")
