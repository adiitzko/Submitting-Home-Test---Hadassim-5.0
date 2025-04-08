import pandas as panda

def time_series(path):
    try:
        # Read the Excel file using pandas
        file = panda.read_excel(path, engine='openpyxl')

        # Check if timestamp is in correct datetime format
        if 'timestamp' in file.columns:
            file['timestamp'] = panda.to_datetime(file['timestamp'], format="%d/%m/%Y %H:%M", errors='coerce')
        else:
            print("Error: 'timestamp' column not found.")
            return None

        # Remove rows with missing dates
        file = file.dropna(subset=['timestamp'])

        # Check if value is a number
        file['value'] = panda.to_numeric(file['value'], errors='coerce')

        # Remove rows with missing values
        file = file.dropna(subset=['value'])

        # Remove duplicate dates
        file = file.drop_duplicates(subset=['timestamp'])

        # Round the hour
        file['hour'] = file['timestamp'].dt.floor('h')

        # Group by the hour and calculate the average by mean for each group
        hourlyData = file.groupby('hour')['value'].mean().reset_index()

        # Output file
        outputFile = 'output_panda.csv'
        hourlyData.to_csv(outputFile, index=False, float_format='%.1f')

        print(f"The data has been successfully saved to '{outputFile}'.")

    except Exception as e:
        print(f"Error: {e}")
        return None

time_series(r"C:\Users\adiit\OneDrive\Desktop\Hadasim\tar1\time_series.xlsx")
