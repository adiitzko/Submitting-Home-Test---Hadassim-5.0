import pandas as panda
import os

def timeSeries(filePath):
    try:
        # Read the Excel file using pandas
        file = panda.read_excel(filePath, engine='openpyxl')

        # Check if timestamp is in correct datetime format
        if 'timestamp' in file.columns:
            file['timestamp'] = panda.to_datetime(file['timestamp'], format="%d/%m/%Y %H:%M", errors='coerce')
        else:
            print(f"Error: 'timestamp' column not found in {filePath}.")
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
        hourly_data = file.groupby('hour')['value'].mean().reset_index()

        # Get the file name
        base_file_name = os.path.basename(filePath)
        file_name_without_ext = os.path.splitext(base_file_name)[0]
        
        # Output file
        outputFile = f'output_{file_name_without_ext}.csv'
        hourly_data.to_csv(outputFile, index=False, float_format='%.1f')

        print(f"The data has been successfully saved to '{outputFile}'.")
        return outputFile

    except Exception as e:
        print(f"Error processing {filePath}: {e}")
        return None

def splitBydate(inputFile):
    try:
        # Read the Excel file using pandas
        file = panda.read_excel(inputFile, engine='openpyxl')

        # Check if timestamp is in correct format
        if 'timestamp' in file.columns:
            file['timestamp'] = panda.to_datetime(file['timestamp'], errors='coerce')
        else:
            print("Error: 'timestamp' column not found.")
            return []

        # Remove rows with missing dates
        file = file.dropna(subset=['timestamp'])

        # Date part from timestamp
        file['date'] = file['timestamp'].dt.date

        # Create a directory for daily files
        outputDir = "daily_files"
        if not os.path.exists(outputDir):
            os.makedirs(outputDir)

        # Split data by date and save to separate files
        outputFiles = []
        
        for date, group in file.groupby('date'):
            stringDate = date.strftime("%Y-%m-%d")
            outputFile = os.path.join(outputDir, f"daily_{stringDate}.xlsx")
            
            # Save only timestamp and value columns
            dailyData = group[['timestamp', 'value']]
            dailyData.to_excel(outputFile, index=False)
            
            print(f"Created file for {stringDate} with {len(dailyData)} records")
            
            # Process each daily file with timeSeries function
            processedFile = timeSeries(outputFile)
            if processedFile:
                outputFiles.append(processedFile)
        
        return outputFiles
    
    except Exception as e:
        print(f"Error splitting file: {e}")
        return []

def mergeFiles(allFiles):
    try:
        if not allFiles:
            print("No files to merge.")
            return None
        
        mergedData = panda.DataFrame()
        
        # Read and append each file
        for file in allFiles:
            if os.path.exists(file):
                file = panda.read_csv(file)
                mergedData = panda.concat([mergedData, file], ignore_index=True)
            else:
                print(f"Warning: File {file} not found.")
        
        if mergedData.empty:
            print("No data to merge.")
            return None
            
        # Sort by hour
        if 'hour' in mergedData.columns:
            mergedData['hour'] = panda.to_datetime(mergedData['hour'])
            mergedData = mergedData.sort_values(by='hour')
        
        # Save the merged data
        mergedFile = 'merged_hourly_averages.csv'
        mergedData.to_csv(mergedFile, index=False, float_format='%.1f')
        
        print(f"Successfully merged {len(allFiles)} files into '{mergedFile}'.")
        return mergedFile
        
    except Exception as e:
        print(f"Error merging files: {e}")
        return None

# Main execution function
def mainFunction(inputFile):    
    
    # Split the file by date
    outputFiles = splitBydate(inputFile)
    
    if not outputFiles:
        print("Failed to split or process files by date.")
        return
    
    # Merge the processed files
    finalFile = mergeFiles(outputFiles)
    
    if finalFile:
        print(f"Process completed. Final output saved to '{finalFile}'.")
    else:
        print("Failed to create the final merged file.")

mainFunction(r"C:\Users\adiit\OneDrive\Desktop\Hadasim\tar1\time_series.xlsx")