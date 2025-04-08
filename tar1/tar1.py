from collections import Counter

def files(input,N):
    f = open(input, 'r')
    lines = f.readlines()  
    i = 0
    totalError={}  #Total frequency dictionary
    result = []
    while i < len(lines):  
        part = lines[i:i+10000]
        i += 10000  

        #Frequency of errors in each part and total for one dictionary
        for line in part:
            errorCodes=frequency(line)
            for code, count in errorCodes.items():
                if code in totalError:
                    totalError[code] += count
                else:
                    totalError[code] = count
            
    #Sort by highest code frequency
    sorteCodes = sorted(totalError.items(), key=lambda item: item[1], reverse=True)

    #Inserting the N most frequency codes into a list
    for code, count in sorteCodes[:N]:
        result.append(f"{code}: {count} times")
        
    f.close()  

    return result

#Error frequency in each part
def frequency(part):
    errorCodes = {}
    words = part.split()  
    for index, word in enumerate(words):
        if word == "Error:":
            errorC = words[index + 1]  
            if errorC in errorCodes:
                errorCodes[errorC] += 1  
            else:
                errorCodes[errorC] = 1 
    return errorCodes 


result=files(r"C:\Users\adiit\OneDrive\Desktop\Hadasim\tar1\logs.txt",5)
for line in result:
    print(line)