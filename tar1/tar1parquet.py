import pandas as panda
import os

def time_series(path):
    try:
        # Determine file extension
        ext = os.path.splitext(path)[1].lower()

        # Read the parquet file using pandas
        file = panda.read_parquet(path)

        # Check if timestamp is in correct datetime format
        if 'timestamp' in file.columns:
            file['timestamp'] = panda.to_datetime(file['timestamp'], format="%d/%m/%Y %H:%M", errors='coerce')
        else:
            print("Error: 'timestamp' column not found.")
            return None

        # Remove rows with missing dates
        file = file.dropna(subset=['timestamp'])

        # Check if value is a number
        file['mean_value'] = panda.to_numeric(file['mean_value'], errors='coerce')

        # Remove rows with missing values
        file = file.dropna(subset=['mean_value'])

        # Remove duplicate timestamps
        file = file.drop_duplicates(subset=['timestamp'])

        # Round the hour
        file['hour'] = file['timestamp'].dt.floor('h')

        # Group by hour and calculate hourly average
        hourly_data = file.groupby('hour')['mean_value'].mean().reset_index()

        # Save output
        output_file = 'output_parquet.csv'
        hourly_data.to_csv(output_file, index=False, float_format='%.1f')
        print(f"The data has been successfully saved to '{output_file}'.")

        return output_file

    except Exception as e:
        print(f"Error: {e}")
        return None

# Example usage
time_series(r"C:\Users\adiit\OneDrive\Desktop\Hadasim\tar1\time_series (4).parquet")
