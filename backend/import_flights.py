import json

import requests


def load_flights(json_file):
    """Load flights data from JSON file"""
    with open(json_file, encoding='utf-8') as f:
        return json.load(f)


def transform_flight(flight_data):
    """Transform flight data from JSON format to API format"""
    return {
        "flight_number": flight_data["flight_number"],
        "flight_date": flight_data["flight_date"],
        "airline_name": flight_data["airline"]["name"],
        "airline_code": flight_data["airline"]["iata"],
        "departure_airport": flight_data["departure"]["airport"],
        "departure_code": flight_data["departure"]["iata"],
        "departure_time": flight_data["departure"]["scheduled"],
        "departure_terminal": flight_data["departure"]["terminal"],
        "departure_gate": flight_data["departure"]["gate"],
        "arrival_airport": flight_data["arrival"]["airport"],
        "arrival_code": flight_data["arrival"]["iata"],
        "arrival_time": flight_data["arrival"]["scheduled"],
        "arrival_terminal": flight_data["arrival"]["terminal"],
        "arrival_gate": flight_data["arrival"]["gate"],
        "price": flight_data["price"],
        "available_seats": flight_data["seats"],
    }


def import_flights(base_url, admin_token, flights_data):
    """Import flights data to API"""
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }

    success_count = 0
    error_count = 0

    for flight in flights_data:
        try:
            transformed_flight = transform_flight(flight)
            response = requests.post(
                f"{base_url}/api/v1/flights/", headers=headers, json=transformed_flight
            )

            if response.status_code == 200 or response.status_code == 201:
                success_count += 1
                print(
                    f"Successfully imported flight {transformed_flight['flight_number']} on {transformed_flight['flight_date']}"
                )
            else:
                error_count += 1
                print(
                    f"Failed to import flight {transformed_flight['flight_number']}: {response.status_code} - {response.text}"
                )
        except Exception as e:
            error_count += 1
            print(
                f"Error processing flight {flight.get('flight_number', 'unknown')}: {str(e)}"
            )

    print(
        f"\nImport completed: {success_count} flights imported successfully, {error_count} errors"
    )


def main():
    # Configuration
    base_url = "http://localhost:8000"
    admin_token = ""
    flight_json_file = "vietnam_flights_2025.json"

    # Get admin token if not provided
    if not admin_token:
        username = "admin@example.com"
        password = "changethis"

        try:
            response = requests.post(
                f"{base_url}/api/v1/signin/access-token",
                data={"username": username, "password": password},
            )

            if response.status_code == 200:
                admin_token = response.json()["access_token"]
                print("Successfully obtained token")
            else:
                print(
                    f"Failed to obtain token: {response.status_code} - {response.text}"
                )
                return
        except Exception as e:
            print(f"Error authenticating: {str(e)}")
            return

    # Load and import flights
    flights_data = load_flights(flight_json_file)
    print(f"Loaded {len(flights_data)} flights from {flight_json_file}")

    import_flights(base_url, admin_token, flights_data)


if __name__ == "__main__":
    main()
