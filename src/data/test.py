import json

# Path to the GeoJSON file
file_path = 'C:\\Users\\moham\\OneDrive\\Documents\\github\\dashbaord templates\\dashboard_test\\src\\data\\tunisiaGeoJSON.geojson'

# Function to extract delegation names
def extract_delegation_names(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)
    delegation_names = []
    for feature in geojson_data['features']:
        if 'properties' in feature and 'circo_na_1' in feature['properties']:
            delegation_names.append(feature['properties']['circo_na_1'])
    return delegation_names

# Extracting delegation names
delegation_names = extract_delegation_names(file_path)

# Printing the delegation names
print(delegation_names)
