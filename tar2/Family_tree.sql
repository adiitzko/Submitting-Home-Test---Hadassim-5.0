
-- Parent
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT Person_Id, Father_Id AS Relative_Id, 'אב' AS Connection_Type 
FROM Persons
WHERE Father_Id IS NOT NULL;

INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT Person_Id, Mother_Id AS Relative_Id, 'אם' AS Connection_Type 
FROM Persons
WHERE Mother_Id IS NOT NULL;

-- Child
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT p1.Person_Id, p2.Person_Id AS Relative_Id, 
          CASE 
            WHEN p2.Gender = 'Female' THEN 'בת'
            WHEN p2.Gender = 'Male' THEN 'בן' END AS Connection_Type
FROM Persons p1
JOIN Persons p2 ON p1.Person_Id = p2.Father_Id OR p1.Person_Id = p2.Mother_Id;

-- Sibling
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT p1.Person_Id, p2.Person_Id AS Relative_Id, 
           CASE WHEN p2.Gender = 'Male' THEN 'אח'
           WHEN p2.Gender = 'Female' THEN 'אחות' END AS Connection_Type
FROM Persons p1
JOIN Persons p2 ON (
    (p1.Father_Id IS NOT NULL AND p1.Father_Id = p2.Father_Id) OR
    (p1.Mother_Id IS NOT NULL AND p1.Mother_Id = p2.Mother_Id)
)
WHERE p1.Person_Id <> p2.Person_Id;

-- Spouse
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT 
    p.Person_Id, 
    p.Spouse_Id AS Relative_Id, 
    CASE 
        WHEN p.Gender = 'Female' AND p2.Gender = 'Male' THEN 'בת זוג'
        WHEN p.Gender = 'Male' AND p2.Gender = 'Female' THEN 'בן זוג'
        WHEN p.Gender = 'Female' AND p2.Gender = 'Female' THEN 'בת זוג'
        WHEN p.Gender = 'Male' AND p2.Gender = 'Male' THEN 'בן זוג'
    END AS Connection_Type
FROM 
    Persons p
JOIN
    Persons p2 ON p.Spouse_Id =p2.Person_Id
WHERE 
    p.Spouse_Id IS NOT NULL;
    
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT 
    p2.Person_Id,
    p.Person_Id AS Relative_Id,
    CASE 
        WHEN p2.Gender = 'Female' AND p.Gender = 'Male' THEN 'בת זוג'
        WHEN p2.Gender = 'Male' AND p.Gender = 'Female' THEN 'בן זוג'
        WHEN p2.Gender = 'Female' AND p.Gender = 'Female' THEN 'בת זוג'
        WHEN p2.Gender = 'Male' AND p.Gender = 'Male' THEN 'בן זוג'
    END AS Connection_Type
FROM 
    Persons p
JOIN
    Persons p2 ON p.Spouse_Id = p2.Person_Id
LEFT JOIN
    family_tree tree ON tree.Person_Id = p2.Person_Id AND tree.Relative_Id = p.Person_Id AND tree.Connection_Type IN ('בן זוג', 'בת זוג')
WHERE 
    p.Spouse_Id IS NOT NULL
    AND tree.Person_Id IS NULL;

