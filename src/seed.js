const mongoose = require('mongoose');
require('dotenv').config();
const ReferenceItem = require('./models/reference.model');

const referenceData = [
  { name: 'Room Rent (General Ward)', normalizedName: 'room rent general ward', aliases: ['ward', 'general ward bed', 'hospital bed'], category: 'Room Charge', standardPrice: 800 },
  { name: 'Room Rent (Semi-Private)', normalizedName: 'room rent semi private', aliases: ['semi private', 'semi-private room'], category: 'Room Charge', standardPrice: 1500 },
  { name: 'Room Rent (Private)', normalizedName: 'room rent private', aliases: ['private room', 'single room', 'deluxe room'], category: 'Room Charge', standardPrice: 3000 },
  { name: 'Room Rent (ICU)', normalizedName: 'room rent icu', aliases: ['icu', 'intensive care', 'critical care'], category: 'Room Charge', standardPrice: 5000 },
  { name: 'Room Rent (NICU)', normalizedName: 'room rent nicu', aliases: ['nicu', 'neonatal icu'], category: 'Room Charge', standardPrice: 4500 },
  { name: 'Room Rent (CCU)', normalizedName: 'room rent ccu', aliases: ['ccu', 'cardiac care unit'], category: 'Room Charge', standardPrice: 5500 },
  { name: 'AC Room Charges', normalizedName: 'ac room charges', aliases: ['air conditioned'], category: 'Room Charge', standardPrice: 1200 },
  { name: 'Deluxe Room', normalizedName: 'deluxe room', aliases: ['deluxe'], category: 'Room Charge', standardPrice: 4000 },
  { name: 'Suite Room', normalizedName: 'suite room', aliases: ['suite'], category: 'Room Charge', standardPrice: 6000 },
  { name: 'Doctor Visit (General)', normalizedName: 'doctor visit general', aliases: ['consultation', 'doctor consultation', 'opd consultation'], category: 'Consultation', standardPrice: 300 },
  { name: 'Doctor Visit (Specialist)', normalizedName: 'doctor visit specialist', aliases: ['specialist consultation', 'specialist visit'], category: 'Consultation', standardPrice: 600 },
  { name: 'Doctor Visit (Senior Specialist)', normalizedName: 'doctor visit senior specialist', aliases: ['senior consultant', 'professor'], category: 'Consultation', standardPrice: 900 },
  { name: 'General Duty Doctor', normalizedName: 'general duty doctor', aliases: ['rmo', 'medical officer'], category: 'Consultation', standardPrice: 250 },
  { name: 'Paracetamol 500mg', normalizedName: 'paracetamol 500mg', aliases: ['crocin', 'acetaminophen', 'calpol'], category: 'Medicine', standardPrice: 5 },
  { name: 'Paracetamol 650mg', normalizedName: 'paracetamol 650mg', aliases: ['paracetamol mr', '650 mg'], category: 'Medicine', standardPrice: 8 },
  { name: 'Amoxicillin 500mg', normalizedName: 'amoxicillin 500mg', aliases: ['amox', 'mox', '500 mg'], category: 'Medicine', standardPrice: 25 },
  { name: 'Azithromycin 500mg', normalizedName: 'azithromycin 500mg', aliases: ['azithro', 'azy 500'], category: 'Medicine', standardPrice: 45 },
  { name: 'Metformin 500mg', normalizedName: 'metformin 500mg', aliases: ['glyciphage', 'met 500'], category: 'Medicine', standardPrice: 12 },
  { name: 'Metformin 850mg', normalizedName: 'metformin 850mg', aliases: ['glyciphage 850'], category: 'Medicine', standardPrice: 18 },
  { name: 'Metformin 1000mg', normalizedName: 'metformin 1000mg', aliases: ['glyciphage 1000'], category: 'Medicine', standardPrice: 22 },
  { name: 'Glimepiride 1mg', normalizedName: 'glimepiride 1mg', aliases: ['glime 1'], category: 'Medicine', standardPrice: 35 },
  { name: 'Glimepiride 2mg', normalizedName: 'glimepiride 2mg', aliases: ['glime 2'], category: 'Medicine', standardPrice: 55 },
  { name: 'Sitagliptin 50mg', normalizedName: 'sitagliptin 50mg', aliases: ['januvia 50'], category: 'Medicine', standardPrice: 180 },
  { name: 'Sitagliptin 100mg', normalizedName: 'sitagliptin 100mg', aliases: ['januvia 100'], category: 'Medicine', standardPrice: 280 },
  { name: 'Atorvastatin 10mg', normalizedName: 'atorvastatin 10mg', aliases: ['storvas 10', 'lipitor 10'], category: 'Medicine', standardPrice: 40 },
  { name: 'Atorvastatin 20mg', normalizedName: 'atorvastatin 20mg', aliases: ['storvas 20'], category: 'Medicine', standardPrice: 65 },
  { name: 'Atorvastatin 40mg', normalizedName: 'atorvastatin 40mg', aliases: ['storvas 40'], category: 'Medicine', standardPrice: 95 },
  { name: 'Rosuvastatin 10mg', normalizedName: 'rosuvastatin 10mg', aliases: ['rosubest 10'], category: 'Medicine', standardPrice: 120 },
  { name: 'Rosuvastatin 20mg', normalizedName: 'rosuvastatin 20mg', aliases: ['rosubest 20'], category: 'Medicine', standardPrice: 180 },
  { name: 'Amlodipine 5mg', normalizedName: 'amlodipine 5mg', aliases: ['amlong 5'], category: 'Medicine', standardPrice: 15 },
  { name: 'Amlodipine 10mg', normalizedName: 'amlodipine 10mg', aliases: ['amlong 10'], category: 'Medicine', standardPrice: 25 },
  { name: 'Telmisartan 40mg', normalizedName: 'telmisartan 40mg', aliases: ['telmikind 40'], category: 'Medicine', standardPrice: 85 },
  { name: 'Telmisartan 80mg', normalizedName: 'telmisartan 80mg', aliases: ['telmikind 80'], category: 'Medicine', standardPrice: 130 },
  { name: 'Losartan 50mg', normalizedName: 'losartan 50mg', aliases: ['losar 50'], category: 'Medicine', standardPrice: 50 },
  { name: 'Bisoprolol 5mg', normalizedName: 'bisoprolol 5mg', aliases: ['biloris 5'], category: 'Medicine', standardPrice: 90 },
  { name: 'Metoprolol 25mg', normalizedName: 'metoprolol 25mg', aliases: ['metolar 25'], category: 'Medicine', standardPrice: 35 },
  { name: 'Pantoprazole 40mg', normalizedName: 'pantoprazole 40mg', aliases: ['pan 40', 'pantocid 40'], category: 'Medicine', standardPrice: 45 },
  { name: 'Pantoprazole 20mg', normalizedName: 'pantoprazole 20mg', aliases: ['pan 20'], category: 'Medicine', standardPrice: 30 },
  { name: 'Rabeprazole 20mg', normalizedName: 'rabeprazole 20mg', aliases: ['rabekind 20'], category: 'Medicine', standardPrice: 55 },
  { name: 'Omeprazole 20mg', normalizedName: 'omeprazole 20mg', aliases: ['omez 20'], category: 'Medicine', standardPrice: 25 },
  { name: 'Domperidone 10mg', normalizedName: 'domperidone 10mg', aliases: ['domstal 10'], category: 'Medicine', standardPrice: 18 },
  { name: 'Ondansetron 4mg', normalizedName: 'ondansetron 4mg', aliases: ['ondem 4', 'zofran 4'], category: 'Medicine', standardPrice: 35 },
  { name: 'Ondansetron 8mg', normalizedName: 'ondansetron 8mg', aliases: ['ondem 8'], category: 'Medicine', standardPrice: 55 },
  { name: 'Cetirizine 10mg', normalizedName: 'cetirizine 10mg', aliases: ['cetzine 10', 'zytec 10'], category: 'Medicine', standardPrice: 15 },
  { name: 'Levocetirizine 5mg', normalizedName: 'levocetirizine 5mg', aliases: ['levocet 5'], category: 'Medicine', standardPrice: 40 },
  { name: 'Fexofenadine 120mg', normalizedName: 'fexofenadine 120mg', aliases: ['fexofen 120'], category: 'Medicine', standardPrice: 65 },
  { name: 'Montelukast 10mg', normalizedName: 'montelukast 10mg', aliases: ['montair 10'], category: 'Medicine', standardPrice: 90 },
  { name: 'Montelukast 4mg', normalizedName: 'montelukast 4mg', aliases: ['montair 4'], category: 'Medicine', standardPrice: 55 },
  { name: 'Salbutamol Inhaler', normalizedName: 'salbutamol inhaler', aliases: ['ventolin', 'asthalin'], category: 'Medicine', standardPrice: 180 },
  { name: 'Budesonide Inhaler', normalizedName: 'budesonide inhaler', aliases: ['budeson'], category: 'Medicine', standardPrice: 350 },
  { name: 'Serum Fibrinogen Test', normalizedName: 'serum fibrinogen test', aliases: ['fibrinogen'], category: 'Lab Test', standardPrice: 450 },
  { name: 'Complete Blood Count', normalizedName: 'complete blood count', aliases: ['cbc', 'blood count'], category: 'Lab Test', standardPrice: 250 },
  { name: 'Liver Function Test', normalizedName: 'liver function test', aliases: ['lft', 'liver profile'], category: 'Lab Test', standardPrice: 600 },
  { name: 'Kidney Function Test', normalizedName: 'kidney function test', aliases: ['kft', 'renal profile'], category: 'Lab Test', standardPrice: 500 },
  { name: 'Lipid Profile', normalizedName: 'lipid profile', aliases: ['cholesterol profile'], category: 'Lab Test', standardPrice: 450 },
  { name: 'Thyroid Profile', normalizedName: 'thyroid profile', aliases: ['t3 t4 tsh'], category: 'Lab Test', standardPrice: 700 },
  { name: 'HbA1c', normalizedName: 'hba1c', aliases: ['glycated hemoglobin', 'hba1c test'], category: 'Lab Test', standardPrice: 400 },
  { name: 'Blood Sugar Fasting', normalizedName: 'blood sugar fasting', aliases: ['fbs', 'fasting sugar'], category: 'Lab Test', standardPrice: 80 },
  { name: 'Blood Sugar Post Prandial', normalizedName: 'blood sugar post prandial', aliases: ['ppbs', 'post lunch sugar'], category: 'Lab Test', standardPrice: 80 },
  { name: 'Urine Routine', normalizedName: 'urine routine', aliases: ['urinalysis'], category: 'Lab Test', standardPrice: 150 },
  { name: 'Stool Routine', normalizedName: 'stool routine', aliases: ['stool exam'], category: 'Lab Test', standardPrice: 150 },
  { name: 'ECG', normalizedName: 'ecg', aliases: ['electrocardiogram', 'heart test'], category: 'Lab Test', standardPrice: 300 },
  { name: '2D Echo', normalizedName: '2d echo', aliases: ['echo', 'echocardiography'], category: 'Lab Test', standardPrice: 2500 },
  { name: 'Stress Test', normalizedName: 'stress test', aliases: ['tmt', 'treadmill test'], category: 'Lab Test', standardPrice: 1800 },
  { name: 'EEG', normalizedName: 'eeg', aliases: ['electroencephalogram'], category: 'Lab Test', standardPrice: 1200 },
  { name: 'CT Scan Brain', normalizedName: 'ct scan brain', aliases: ['ct brain', 'ct head'], category: 'Imaging', standardPrice: 3500 },
  { name: 'CT Scan Chest', normalizedName: 'ct scan chest', aliases: ['ct chest'], category: 'Imaging', standardPrice: 4500 },
  { name: 'CT Scan Abdomen', normalizedName: 'ct scan abdomen', aliases: ['ct abdomen'], category: 'Imaging', standardPrice: 5000 },
  { name: 'MRI Brain', normalizedName: 'mri brain', aliases: ['mri head'], category: 'Imaging', standardPrice: 8000 },
  { name: 'MRI Spine', normalizedName: 'mri spine', aliases: ['mri backbone'], category: 'Imaging', standardPrice: 9000 },
  { name: 'Ultrasound Whole Abdomen', normalizedName: 'ultrasound whole abdomen', aliases: ['usg abdomen', 'full abdomen ultrasound'], category: 'Imaging', standardPrice: 1200 },
  { name: 'X-Ray Chest', normalizedName: 'x ray chest', aliases: ['xray chest', 'chest xray'], category: 'Imaging', standardPrice: 300 },
  { name: 'X-Ray Spine', normalizedName: 'x ray spine', aliases: ['xray spine'], category: 'Imaging', standardPrice: 350 },
  { name: 'Injection Paracetamol IV', normalizedName: 'injection paracetamol iv', aliases: ['iv paracetamol', 'perfalgan iv'], category: 'Injection', standardPrice: 85 },
  { name: 'Injection Ceftriaxone 1g', normalizedName: 'injection ceftriaxone 1g', aliases: ['ceftriaxone injection', 'monocef 1g'], category: 'Injection', standardPrice: 120 },
  { name: 'Injection Ceftriaxone 500mg', normalizedName: 'injection ceftriaxone 500mg', aliases: ['monocef 500'], category: 'Injection', standardPrice: 85 },
  { name: 'Injection Amoxicillin', normalizedName: 'injection amoxicillin', aliases: ['amox injection'], category: 'Injection', standardPrice: 95 },
  { name: 'Injection Metoclopramide', normalizedName: 'injection metoclopramide', aliases: ['metoclopramide', 'vomiloc'], category: 'Injection', standardPrice: 25 },
  { name: 'Injection Ondansetron', normalizedName: 'injection ondansetron', aliases: ['ondansetron iv'], category: 'Injection', standardPrice: 65 },
  { name: 'Injection Ranitidine', normalizedName: 'injection ranitidine', aliases: ['ranitidine iv'], category: 'Injection', standardPrice: 35 },
  { name: 'Injection Pantoprazole', normalizedName: 'injection pantoprazole', aliases: ['pantoprazole iv'], category: 'Injection', standardPrice: 75 },
  { name: 'Injection Buscopan', normalizedName: 'injection buscopan', aliases: ['hyoscine butylbromide'], category: 'Injection', standardPrice: 45 },
  { name: 'Injection Diclofenac', normalizedName: 'injection diclofenac', aliases: ['diclofenac sodium', 'voveran'], category: 'Injection', standardPrice: 20 },
  { name: 'Injection Tramadol', normalizedName: 'injection tramadol', aliases: ['tramadol iv'], category: 'Injection', standardPrice: 55 },
  { name: 'Injection Morphine', normalizedName: 'injection morphine', aliases: ['morphine sulfate'], category: 'Injection', standardPrice: 85 },
  { name: 'Injection Insulin (Regular)', normalizedName: 'injection insulin regular', aliases: ['regular insulin', 'huminsulin r'], category: 'Injection', standardPrice: 95 },
  { name: 'Injection Insulin (NPH)', normalizedName: 'injection insulin nph', aliases: ['nph insulin', 'huminsulin n'], category: 'Injection', standardPrice: 110 },
  { name: 'Surgery - Appendectomy', normalizedName: 'surgery appendectomy', aliases: ['appendectomy', 'appendix surgery'], category: 'Surgery', standardPrice: 25000 },
  { name: 'Surgery - Cholecystectomy', normalizedName: 'surgery cholecystectomy', aliases: ['gallbladder surgery', 'lap chole'], category: 'Surgery', standardPrice: 45000 },
  { name: 'Surgery - Hernia Repair', normalizedName: 'surgery hernia repair', aliases: ['hernia operation'], category: 'Surgery', standardPrice: 35000 },
  { name: 'Surgery - Hydrocele', normalizedName: 'surgery hydrocele', aliases: ['hydrocele operation'], category: 'Surgery', standardPrice: 18000 },
  { name: 'Surgery - Piles (Hemorrhoids)', normalizedName: 'surgery piles', aliases: ['hemorrhoidectomy', 'pile surgery'], category: 'Surgery', standardPrice: 22000 },
  { name: 'Surgery - Fistula', normalizedName: 'surgery fistula', aliases: ['fistula operation'], category: 'Surgery', standardPrice: 28000 },
  { name: 'Surgery - Fissure', normalizedName: 'surgery fissure', aliases: ['fissurectomy'], category: 'Surgery', standardPrice: 24000 },
  { name: 'Surgery - Thyroid', normalizedName: 'surgery thyroid', aliases: ['thyroidectomy'], category: 'Surgery', standardPrice: 55000 },
  { name: 'Surgery - Cataract', normalizedName: 'surgery cataract', aliases: ['cataract surgery', 'iol'], category: 'Surgery', standardPrice: 35000 },
  { name: 'Surgery - Cesarean Section', normalizedName: 'surgery cesarean', aliases: ['c section', 'lscs'], category: 'Surgery', standardPrice: 45000 },
  { name: 'Surgery - Normal Delivery', normalizedName: 'surgery normal delivery', aliases: ['normal delivery', 'nd'], category: 'Surgery', standardPrice: 15000 },
  { name: 'Dialysis (Hemodialysis)', normalizedName: 'dialysis hemodialysis', aliases: ['dialysis', 'hd', 'hemodialysis'], category: 'Procedure', standardPrice: 1800 },
  { name: 'Dialysis (Peritoneal)', normalizedName: 'dialysis peritoneal', aliases: ['capd', 'peritoneal dialysis'], category: 'Procedure', standardPrice: 1200 },
  { name: 'Nebulization', normalizedName: 'nebulization', aliases: ['neb', 'nebuliser'], category: 'Procedure', standardPrice: 180 },
  { name: 'Oxygen Therapy (Per Hour)', normalizedName: 'oxygen therapy', aliases: ['o2 therapy', 'supplemental oxygen'], category: 'Procedure', standardPrice: 80 },
  { name: 'Physiotherapy Session', normalizedName: 'physiotherapy session', aliases: ['pt session', 'rehab'], category: 'Procedure', standardPrice: 300 },
  { name: 'Catheterization', normalizedName: 'catheterization', aliases: ['catheter'], category: 'Procedure', standardPrice: 450 },
  { name: 'Suctioning', normalizedName: 'suctioning', aliases: ['endotracheal suction'], category: 'Procedure', standardPrice: 120 },
  { name: 'Enema', normalizedName: 'enema', aliases: ['fleet enema'], category: 'Procedure', standardPrice: 180 },
  { name: 'Ryles Tube Insertion', normalizedName: 'ryles tube', aliases: ['ng tube', 'nasogastric tube'], category: 'Procedure', standardPrice: 150 },
  { name: 'Bladder Catheterization', normalizedName: 'bladder catheter', aliases: ['foley catheter'], category: 'Procedure', standardPrice: 250 },
  { name: 'Wheelchair Charges', normalizedName: 'wheelchair charges', aliases: ['wheelchair'], category: 'Equipment', standardPrice: 100 },
  { name: 'Stretcher Charges', normalizedName: 'stretcher charges', aliases: ['stretcher'], category: 'Equipment', standardPrice: 150 },
  { name: 'Pulse Oximeter', normalizedName: 'pulse oximeter', aliases: ['spo2 monitor'], category: 'Equipment', standardPrice: 80 },
  { name: 'BP Apparatus', normalizedName: 'bp apparatus', aliases: ['bp monitor'], category: 'Equipment', standardPrice: 50 },
  { name: 'Glucometer', normalizedName: 'gluco meter', aliases: ['glucometer'], category: 'Equipment', standardPrice: 60 },
  { name: 'OT Charges', normalizedName: 'ot charges', aliases: ['operation theatre', 'operation theater'], category: 'Operation Theatre', standardPrice: 3000 },
  { name: 'OT - Minor', normalizedName: 'ot minor', aliases: ['minor ot'], category: 'Operation Theatre', standardPrice: 1500 },
  { name: 'OT - Major', normalizedName: 'ot major', aliases: ['major ot'], category: 'Operation Theatre', standardPrice: 5000 },
  { name: 'Recovery Room', normalizedName: 'recovery room', aliases: ['post op room'], category: 'Operation Theatre', standardPrice: 800 },
  { name: 'Labour Room', normalizedName: 'labour room', aliases: ['ldr room', 'delivery room'], category: 'Operation Theatre', standardPrice: 1200 },
  { name: 'Blood Transfusion (Per Unit)', normalizedName: 'blood transfusion', aliases: ['blood transfer', 'bt'], category: 'Blood', standardPrice: 1500 },
  { name: 'Platelet Rich Plasma', normalizedName: 'platelet rich plasma', aliases: ['prp'], category: 'Blood', standardPrice: 2500 },
  { name: 'Fresh Frozen Plasma', normalizedName: 'fresh frozen plasma', aliases: ['ffp'], category: 'Blood', standardPrice: 1800 },
  { name: 'Packed Cells', normalizedName: 'packed cells', aliases: ['prbc'], category: 'Blood', standardPrice: 1200 },
  { name: 'Platelet Concentrate', normalizedName: 'platelet concentrate', aliases: ['platelet'], category: 'Blood', standardPrice: 800 },
  { name: 'Nursing Charges (Per Day)', normalizedName: 'nursing charges', aliases: ['nursing'], category: 'Services', standardPrice: 400 },
  { name: 'Security Deposit', normalizedName: 'security deposit', aliases: ['deposit', 'caution money'], category: 'Services', standardPrice: 5000 },
  { name: 'Admission Charges', normalizedName: 'admission charges', aliases: ['registration'], category: 'Services', standardPrice: 200 },
  { name: 'Discharge Processing', normalizedName: 'discharge processing', aliases: ['discharge'], category: 'Services', standardPrice: 150 },
  { name: 'Medical Records', normalizedName: 'medical records', aliases: ['mrd'], category: 'Services', standardPrice: 100 },
  { name: 'Certificate Charges', normalizedName: 'certificate charges', aliases: ['medical certificate'], category: 'Services', standardPrice: 150 },
  { name: 'Ambulance Charges', normalizedName: 'ambulance charges', aliases: ['ambulance'], category: 'Services', standardPrice: 500 },
  { name: 'Attendant Bed', normalizedName: 'attendant bed', aliases: ['attendant cot'], category: 'Services', standardPrice: 200 },
  { name: 'Trolley Charges', normalizedName: 'trolley charges', aliases: ['trolley'], category: 'Services', standardPrice: 100 },
  { name: 'Linen Charges', normalizedName: 'linen charges', aliases: ['bedsheet'], category: 'Services', standardPrice: 80 },
  { name: 'Diet Charges (Per Day)', normalizedName: 'diet charges', aliases: ['food', 'patient diet'], category: 'Services', standardPrice: 300 },
  { name: 'Patient Coat', normalizedName: 'patient coat', aliases: ['patient gown'], category: 'Services', standardPrice: 120 },
  { name: 'Syringe', normalizedName: 'syringe', aliases: ['syringe 2ml', 'syringe 5ml'], category: 'Consumable', standardPrice: 8 },
  { name: 'IV Set', normalizedName: 'iv set', aliases: ['infusion set'], category: 'Consumable', standardPrice: 45 },
  { name: 'IV Cannula (18G)', normalizedName: 'iv cannula 18g', aliases: ['cannula 18'], category: 'Consumable', standardPrice: 120 },
  { name: 'IV Cannula (20G)', normalizedName: 'iv cannula 20g', aliases: ['cannula 20'], category: 'Consumable', standardPrice: 100 },
  { name: 'IV Cannula (22G)', normalizedName: 'iv cannula 22g', aliases: ['cannula 22'], category: 'Consumable', standardPrice: 85 },
  { name: 'Foley Catheter', normalizedName: 'foley catheter', aliases: ['foley'], category: 'Consumable', standardPrice: 180 },
  { name: 'Nasogastric Tube', normalizedName: 'nasogastric tube', aliases: ['ng tube'], category: 'Consumable', standardPrice: 65 },
  { name: 'Urinary Bag', normalizedName: 'urinary bag', aliases: ['urine bag'], category: 'Consumable', standardPrice: 85 },
  { name: 'Surgical Blade', normalizedName: 'surgical blade', aliases: ['blade'], category: 'Consumable', standardPrice: 25 },
  { name: 'Suture Material', normalizedName: 'suture material', aliases: ['suture', 'thread'], category: 'Consumable', standardPrice: 150 },
  { name: 'Cotton Roll', normalizedName: 'cotton roll', aliases: ['cotton'], category: 'Consumable', standardPrice: 15 },
  { name: 'Bandage', normalizedName: 'bandage', aliases: ['bandage roll'], category: 'Consumable', standardPrice: 35 },
  { name: 'Gauze', normalizedName: 'gauze', aliases: ['gauze piece'], category: 'Consumable', standardPrice: 20 },
  { name: 'Micropore', normalizedName: 'micropore', aliases: ['surgical tape'], category: 'Consumable', standardPrice: 25 },
  { name: 'Betadine Solution', normalizedName: 'betadine solution', aliases: ['povidone iodine'], category: 'Consumable', standardPrice: 45 },
  { name: 'Hydrogen Peroxide', normalizedName: 'hydrogen peroxide', aliases: ['h2o2'], category: 'Consumable', standardPrice: 25 },
  { name: 'Spirit', normalizedName: 'spirit', aliases: ['isopropyl alcohol'], category: 'Consumable', standardPrice: 30 },
  { name: 'Gloves (Pair)', normalizedName: 'gloves', aliases: ['surgical gloves'], category: 'Consumable', standardPrice: 25 },
  { name: 'Mask', normalizedName: 'mask', aliases: ['face mask', 'surgical mask'], category: 'Consumable', standardPrice: 15 },
  { name: 'Cap', normalizedName: 'cap', aliases: ['surgical cap'], category: 'Consumable', standardPrice: 10 },
  { name: 'Apron', normalizedName: 'apron', aliases: ['disposable apron'], category: 'Consumable', standardPrice: 30 },
  { name: 'Sanitizer (100ml)', normalizedName: 'sanitizer', aliases: ['hand sanitizer'], category: 'Consumable', standardPrice: 40 },
  { name: 'VTM (Viral Transport Medium)', normalizedName: 'vtm', aliases: ['viral transport'], category: 'Consumable', standardPrice: 35 },
  { name: 'RBC/Platelet Set', normalizedName: 'rbc platelet set', aliases: ['bt set'], category: 'Consumable', standardPrice: 80 },
  { name: 'Extension Tube', normalizedName: 'extension tube', aliases: ['extension line'], category: 'Consumable', standardPrice: 35 },
  { name: 'Three Way Stopcock', normalizedName: 'three way stopcock', aliases: ['stopcock'], category: 'Consumable', standardPrice: 25 },
  { name: 'Tourniquet', normalizedName: 'tourniquet', aliases: ['tourniquet band'], category: 'Consumable', standardPrice: 40 },
  { name: 'Bed Sheet', normalizedName: 'bed sheet', aliases: ['bedsheets'], category: 'Linen', standardPrice: 60 },
  { name: 'Pillow', normalizedName: 'pillow', aliases: ['pillow cover'], category: 'Linen', standardPrice: 40 },
  { name: 'Blanket', normalizedName: 'blanket', aliases: ['comforter'], category: 'Linen', standardPrice: 80 },
  { name: 'Towel', normalizedName: 'towel', aliases: ['hand towel'], category: 'Linen', standardPrice: 35 },
  { name: 'Patient Gown', normalizedName: 'patient gown', aliases: ['patient coat'], category: 'Linen', standardPrice: 50 }
];

const addMaxAllowedPrice = (items) => {
  return items.map(item => ({
    ...item,
    maxAllowedPrice: Math.round(item.standardPrice * 1.5)
  }));
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medclear');
    console.log('Connected to MongoDB');

    await ReferenceItem.deleteMany({});
    console.log('Cleared existing reference data');

    const dataWithMax = addMaxAllowedPrice(referenceData);
    await ReferenceItem.insertMany(dataWithMax);
    console.log(`Seeded ${dataWithMax.length} reference items with maxAllowedPrice`);

    const Scheme = require('./models/Scheme');
    await Scheme.deleteMany({});
    console.log('Cleared existing scheme data');

    const schemes = [
      {
        name: 'Ayushman Bharat PM-JAY',
        minIncome: 0,
        maxIncome: 500000, // typically targeted at lower-income, proxy
        states: [], // National
        benefits: ['Up to ₹5 lakhs per family per year', 'Covers secondary and tertiary care hospitalization', 'Cashless access to health care services'],
        coverageAmount: 500000,
        description: 'A national public health insurance fund of the Government of India that aims to provide free access to health insurance coverage for low income earners in the country.'
      },
      {
        name: 'Mahatma Jyotiba Phule Jan Arogya Yojana',
        minIncome: 0,
        maxIncome: 100000, // For BPL/Annapurna/Antyodaya
        states: ['Maharashtra'],
        benefits: ['Up to ₹1.5 lakhs per family per year', 'Covers 971 surgeries/therapies/procedures', 'Free follow-up consultations'],
        coverageAmount: 150000,
        description: 'A flagship health insurance scheme of the Government of Maharashtra providing end to end cashless services for identified diseases through a network of service providers.'
      },
      {
        name: 'Central Government Health Scheme (CGHS)',
        minIncome: 0,
        maxIncome: 10000000, // Applies to central govt employees regardless of income, setting high bound
        states: [], // National
        benefits: ['Comprehensive medical care', 'Dispensary services including medicines', 'Hospitalization at government and empanelled hospitals'],
        coverageAmount: 1000000, // Proxy value
        description: 'Provides comprehensive medical care to the Central Government employees and pensioners enrolled under the scheme.'
      },
      {
        name: 'Chief Minister\'s Comprehensive Health Insurance Scheme',
        minIncome: 0,
        maxIncome: 120000,
        states: ['Tamil Nadu'],
        benefits: ['Up to ₹5 lakhs per family per year', 'Cashless treatment at empanelled hospitals'],
        coverageAmount: 500000,
        description: 'A scheme by the Tamil Nadu government to provide quality healthcare to eligible persons.'
      },
      {
        name: 'Biju Swasthya Kalyan Yojana',
        minIncome: 0,
        maxIncome: 500000,
        states: ['Odisha'],
        benefits: ['Up to ₹5 lakhs per family per year (₹10 lakhs for women members)', 'Universal health coverage in state govt hospitals'],
        coverageAmount: 500000,
        description: 'An initiative by the Government of Odisha to provide universal health coverage, with special emphasis on the health protection of economically vulnerable families.'
      }
    ];

    await Scheme.insertMany(schemes);
    console.log(`Seeded ${schemes.length} government schemes`);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();