import math

def calculate_distance(point1, point2):
    """Calculate Euclidean distance between two points."""
    return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)

def find_nearest_neighbor(current_location, locations):
    """Find the nearest location from the current position."""
    return min(locations, key=lambda loc: calculate_distance(current_location, loc))

def optimize_delivery_route(locations, priorities):
    """Optimize delivery route based on priority and minimize travel distance."""
    priority_map = {"high": 1, "medium": 2, "low": 3}
    deliveries = list(zip(locations, priorities))

    # Sort deliveries by priority
    sorted_deliveries = sorted(deliveries, key=lambda x: priority_map[x[1]])

    optimized_route = []
    total_distance = 0
    unvisited_locations = [loc for loc, _ in sorted_deliveries]

    # Start from the nearest high-priority location
    current_location = find_nearest_neighbor((0, 0), unvisited_locations)
    optimized_route.append(current_location)
    unvisited_locations.remove(current_location)

    # Visit remaining locations using nearest neighbor approach
    while unvisited_locations:
        next_location = find_nearest_neighbor(current_location, unvisited_locations)
        total_distance += calculate_distance(current_location, next_location)
        optimized_route.append(next_location)
        current_location = next_location
        unvisited_locations.remove(next_location)

    return optimized_route, round(total_distance, 2)

# Example Input
locations = [(0, 0), (2, 3), (5, 1), (6, 4), (1, 2)]
priorities = ["high", "medium", "high", "low", "medium"]

# Call the function
optimized_route, total_distance = optimize_delivery_route(locations, priorities)

# Output
print("Optimized Route:", optimized_route)
print("Total Distance:", total_distance)
