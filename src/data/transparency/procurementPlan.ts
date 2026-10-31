import { ProcurementPlanYear } from '@/types/procurementPlan';

/**
 * Annual Procurement Plan (APP) totals by department, Province of Aklan.
 * This is planned procurement budget, not actual PhilGEPS contract awards
 * (see the live award search above for those).
 */
const procurementPlan: ProcurementPlanYear[] = [
  {
    year: 2024,
    grandTotal: 746_159_664.91,
    sourceNote:
      "Reconstructed by summing every line item in the full APP 2024 line-item schedule (no official one-page summary was published for this year, unlike 2025/2026). Department heads weren't listed in that source.",
    departments: [
      { department: "Provincial Engineer's Office", totalCost: 244_890_800.0 },
      {
        department: 'Dr. Rafael S. Tumbokon Memorial Hospital',
        totalCost: 123_923_487.61,
      },
      { department: 'EEDD-Port Operations', totalCost: 83_363_000.0 },
      {
        department: "Provincial Governor's Office",
        totalCost: 79_480_962.0,
      },
      { department: 'Ibajay District Hospital', totalCost: 43_293_481.0 },
      {
        department: 'Office of the Provincial Agriculturist',
        totalCost: 22_605_725.0,
      },
      { department: 'Department of Education', totalCost: 21_525_963.9 },
      {
        department: 'Provincial Disaster Risk Reduction & Management Office',
        totalCost: 17_181_387.2,
      },
      {
        department: 'Provincial Social Welfare & Development Office',
        totalCost: 16_023_410.0,
      },
      { department: 'Provincial Health Office', totalCost: 13_932_830.0 },
      {
        department: 'Aklan Provincial Tourism Office',
        totalCost: 13_410_025.0,
      },
      { department: 'Sangguniang Panlalawigan', totalCost: 10_100_000.0 },
      { department: 'Ciriaco S. Tirol Hospital', totalCost: 6_748_431.04 },
      { department: 'Godofredo P. Ramos Hospital', totalCost: 6_219_505.6 },
      {
        department: 'EEDD-Resort/Hotel Operations',
        totalCost: 5_379_641.0,
      },
      { department: 'Peace and Order Program', totalCost: 5_136_633.0 },
      {
        department: 'PGO-Aklan Tourism Trade Investment & Promotional Center',
        totalCost: 3_913_764.0,
      },
      {
        department: 'Provincial Planning & Development Office',
        totalCost: 3_759_768.75,
      },
      {
        department: 'Office of the Provincial Veterinarian',
        totalCost: 2_711_810.0,
      },
      { department: 'EEDD-CCO', totalCost: 2_689_104.0 },
      { department: 'Malay Municipal Hospital', totalCost: 2_546_400.0 },
      {
        department: 'Provincial Youth Development Office',
        totalCost: 2_308_685.0,
      },
      {
        department: 'Provincial General Services Office',
        totalCost: 2_192_500.0,
      },
      {
        department: 'Persons With Disability Affairs Office',
        totalCost: 1_958_000.0,
      },
      { department: 'Buruanga Municipal Hospital', totalCost: 1_108_718.0 },
      { department: "Provincial Treasurer's Office", totalCost: 1_040_000.0 },
      {
        department: 'Don Leovigildo N. Diapo Sr. Municipal Hospital',
        totalCost: 1_013_628.0,
      },
      { department: 'Libacao Municipal Infirmary', totalCost: 985_000.0 },
      { department: "Provincial Assessor's Office", totalCost: 820_000.0 },
      { department: 'Sports Development Program', totalCost: 723_660.0 },
      {
        department:
          'Office of the Provincial Public Employment Service Manager',
        totalCost: 720_438.41,
      },
      {
        department: 'Aklan Environmental & Natural Resources Office',
        totalCost: 640_379.0,
      },
      {
        department: 'Aklan Provincial Population & Gender Office',
        totalCost: 594_750.0,
      },
      {
        department: 'Provincial Human Resource Management Office',
        totalCost: 567_417.0,
      },
      { department: 'Provincial Accounting Office', totalCost: 523_108.0 },
      { department: 'Provincial Budget Office', totalCost: 477_208.0 },
      { department: 'Commission On Audit', totalCost: 442_549.0 },
      {
        department: 'EEDD-Admin Support Services',
        totalCost: 302_000.0,
      },
      { department: 'Bids and Awards Committee', totalCost: 300_000.0 },
      {
        department:
          'Aklan Provincial Information & Communication Technology Office',
        totalCost: 297_000.0,
      },
      { department: 'Provincial Legal Office', totalCost: 120_000.0 },
      {
        department: 'Aklan Provincial Internal Audit Office',
        totalCost: 109_772.0,
      },
      {
        department: "Provincial Prosecutor's Office",
        totalCost: 78_723.4,
      },
    ],
  },
  {
    year: 2025,
    grandTotal: 740_048_295.62,
    sourceNote:
      'As published in the official Form 4b - APP Summary, Province of Aklan.',
    departments: [
      {
        department: "Provincial Governor's Office",
        head: 'Hon. Jose Enrique M. Miraflores',
        totalCost: 65_939_206.44,
      },
      {
        department: 'PGO-Aklan Culture and Arts Foundation, Inc.',
        head: 'Albert Meñez',
        totalCost: 49_961.0,
      },
      {
        department: 'PGO-Barangay Affairs Office',
        head: 'Ivan D. Patron, Jr.',
        totalCost: 4_379_800.0,
      },
      {
        department: 'PGO-Provincial Youth Development Office',
        head: 'Jannica Ann Dela Peña',
        totalCost: 2_523_915.0,
      },
      {
        department: 'PGO-Sports Development Program',
        head: 'Gerick Templonuevo',
        totalCost: 1_881_526.0,
      },
      {
        department: 'PGO-Aklan Rehabilitation Center',
        head: 'PLTCOL. Ariel N. Nacar (Ret.)',
        totalCost: 750_000.0,
      },
      {
        department: 'PGO-Philippine National Police',
        head: 'PCol Arnel E. Ramos',
        totalCost: 2_880_423.0,
      },
      {
        department: 'PGO-Philippine Army',
        head: 'Atty. Selwyn C. Ibarreta',
        totalCost: 950_120.0,
      },
      {
        department: 'PGO-Bureau of Fire Protection',
        head: 'Atty. Selwyn C. Ibarreta',
        totalCost: 302_000.0,
      },
      {
        department: 'Provincial Disaster Risk Reduction & Management Office',
        head: 'Manuel Jayfree M. Jizmundo',
        totalCost: 3_890_389.0,
      },
      {
        department: 'PGO-Philippine Drug Enforcement Agency',
        head: 'Atty. Selwyn C. Ibarreta',
        totalCost: 428_644.0,
      },
      {
        department: 'Provincial Administrator Office',
        head: 'Atty. Selwyn C. Ibarreta',
        totalCost: 5_670_317.0,
      },
      {
        department: 'Bids and Awards Committee',
        head: 'Atty. Selwyn C. Ibarreta',
        totalCost: 300_000.0,
      },
      {
        department: 'PGO-Aklan Tourism Trade Investment & Promotional Center',
        head: 'Marsh B. Bernabe',
        totalCost: 2_982_540.0,
      },
      {
        department: 'Sangguniang Panlalawigan',
        head: 'Atty. Reynaldo Quimpo',
        totalCost: 7_056_900.0,
      },
      {
        department: 'Provincial Human Resource Management Office',
        head: 'Methuselah T. Santamaria',
        totalCost: 2_878_179.0,
      },
      {
        department: 'Provincial Planning & Development Office',
        head: 'Engr. Roger M. Esto',
        totalCost: 4_537_790.0,
      },
      {
        department: "Provincial Treasurer's Office",
        head: 'Bernardino R. Villaruel',
        totalCost: 1_016_000.0,
      },
      {
        department: 'Provincial Budget Office',
        head: 'Ivy R. Redison',
        totalCost: 451_500.0,
      },
      {
        department: "Provincial Assessor's Office",
        head: 'Kokoy B. Soguilon',
        totalCost: 829_700.0,
      },
      {
        department: 'Provincial Accounting Office',
        head: 'Theresa S. Templonuevo',
        totalCost: 240_558.0,
      },
      {
        department: 'Provincial General Services Office',
        head: 'Jericson C. Bello',
        totalCost: 2_296_364.0,
      },
      {
        department: 'Provincial Legal Office',
        head: 'Atty. Lorielle L. Rovero',
        totalCost: 23_100.0,
      },
      {
        department: 'Aklan Provincial Internal Audit Office',
        head: 'Brenda O. Magalit',
        totalCost: 40_250.0,
      },
      {
        department:
          'Aklan Provincial Information & Communication Technology Office',
        head: 'Jericson C. Bello',
        totalCost: 1_820_600.0,
      },
      {
        department: 'EEDD-Admin Support Services',
        head: 'Jericson C. Bello',
        totalCost: 290_500.0,
      },
      {
        department: "Public Attorney's Office",
        head: 'Atty. Ervie S. Taytayon',
        totalCost: 173_514.0,
      },
      {
        department: 'Commission On Audit',
        head: 'Atty. Joseph Laguna',
        totalCost: 264_100.0,
      },
      {
        department: 'Office of the Provincial Agriculturist',
        head: 'Engr. Alexys Apolonio',
        totalCost: 32_309_148.5,
      },
      {
        department: "Provincial Engineer's Office",
        head: 'Engr. Edelzon T. Magalit',
        totalCost: 301_170_000.0,
      },
      {
        department: 'Office of the Provincial Veterinarian',
        head: 'Dr. Ma. Cyrosa Leen Mabel C. Siñel',
        totalCost: 2_756_410.0,
      },
      {
        department: 'Aklan Environment & Natural Resources Office',
        head: 'Engr. Kenneth Almalbis',
        totalCost: 2_124_362.0,
      },
      {
        department: 'Aklan Provincial Tourism Office',
        head: 'Roselle Ruiz',
        totalCost: 13_771_701.0,
      },
      {
        department:
          'Office of the Provincial Public Employment Service Manager',
        head: 'Marsh B. Bernabe',
        totalCost: 1_475_789.0,
      },
      {
        department: 'Provincial Social Welfare & Development Office',
        head: 'Evangelina F. Gallega',
        totalCost: 17_709_951.0,
      },
      {
        department: 'Persons With Disability Affairs Office',
        head: 'Randy Rebaldo',
        totalCost: 2_251_000.0,
      },
      {
        department: 'Aklan Provincial Population & Gender Office',
        head: 'Franklin L. Quimpo',
        totalCost: 861_585.0,
      },
      {
        department: 'Provincial Health Office',
        head: 'Dr. Leslie Ann L. Sedillo',
        totalCost: 14_459_527.0,
      },
      {
        department: 'Buruanga Municipal Hospital',
        head: 'Dr. Niño Jerryl S. Dela Torre',
        totalCost: 1_150_468.0,
      },
      {
        department: 'Libacao Municipal Infirmary',
        head: 'Dr. Stig U. Valencia',
        totalCost: 1_020_000.0,
      },
      {
        department: 'Ciriaco S. Tirol Hospital',
        head: 'Dr. Karol Mark M. Lachica',
        totalCost: 1_397_484.0,
      },
      {
        department: 'Don Leovigildo N. Diapo Sr. Municipal Hospital',
        head: 'Dr. Stevens N. Fuentes',
        totalCost: 1_062_075.0,
      },
      {
        department: 'Malay Municipal Hospital',
        head: 'Dr. Janeth P. Japitana',
        totalCost: 1_089_370.0,
      },
      {
        department: 'Godofredo P. Ramos Hospital',
        head: 'Dr. Julius R. Gonzales',
        totalCost: 4_979_541.0,
      },
      {
        department: 'EEDD-Port Operations',
        head: 'Esel L. Flores',
        totalCost: 137_101_540.0,
      },
      {
        department: 'EEDD-CCO',
        head: 'Dr. Michael I. Terencio',
        totalCost: 1_620_000.0,
      },
      {
        department: 'Dr. Rafael S. Tumbokon Memorial Hospital',
        head: 'Dr. Cornelio V. Cuachon, Jr.',
        totalCost: 34_080_276.93,
      },
      {
        department: 'Ibajay District Hospital',
        head: 'Dr. Mary Jean A. Gelito',
        totalCost: 22_823_360.0,
      },
      {
        department: 'PHO (Special Health Fund)',
        head: 'Dr. Leslie Ann L. Sedillo',
        totalCost: 1_083_000.0,
      },
      {
        department: 'Department of Education',
        head: 'Feliciano C. Buenafe, Jr. CESO VI',
        totalCost: 28_063_810.75,
      },
      {
        department: 'Department of Transportation',
        head: 'Atty. Selwyn C. Ibarreta',
        totalCost: 840_000.0,
      },
    ],
  },
  {
    year: 2026,
    grandTotal: 892_560_306.36,
    sourceNote:
      'As published in the official Form 4b - APP Summary, Province of Aklan.',
    departments: [
      {
        department: "Provincial Governor's Office",
        head: 'Hon. Jose Enrique M. Miraflores',
        totalCost: 83_333_851.0,
      },
      {
        department: 'PGO-Barangay Affairs Office',
        head: 'Ivan D. Patron, Jr.',
        totalCost: 5_000_030.0,
      },
      {
        department: 'PGO-Provincial Youth Development Office',
        head: 'Jannica Ann Dela Peña',
        totalCost: 1_546_393.0,
      },
      {
        department: 'PGO-ARC-Peace and Order Public Safety',
        head: 'PltCol. Ariel N. Nacar (Ret.)',
        totalCost: 300_000.0,
      },
      {
        department: 'PGO-Peace and Order and Public Safety Programs',
        head: 'Atty. Selwyn C. Ibarreta',
        totalCost: 5_473_576.0,
      },
      {
        department: 'PGO-Anti-Illegal Drugs Campaign',
        head: 'Atty. Selwyn C. Ibarreta',
        totalCost: 1_418_124.0,
      },
      {
        department:
          'PGO - Provincial Disaster Risk Reduction & Management Office',
        head: 'Manuel Jayfree M. Jizmundo',
        totalCost: 22_275_050.0,
      },
      {
        department: "Provincial Administrator's Office",
        head: 'Atty. Selwyn C. Ibarreta',
        totalCost: 2_438_682.4,
      },
      {
        department: 'Sangguniang Panlalawigan',
        head: 'Atty. Reynaldo Quimpo',
        totalCost: 12_401_000.0,
      },
      {
        department: 'Provincial Human Resource Management Office',
        head: 'Methuselah T. Santamaria',
        totalCost: 1_447_688.0,
      },
      {
        department: 'Provincial Planning & Development Office',
        head: 'Engr. Roger M. Esto',
        totalCost: 7_978_906.0,
      },
      {
        department: "Provincial Treasurer's Office",
        head: 'Bernardino R. Villaruel',
        totalCost: 1_445_623.0,
      },
      {
        department: 'Provincial Budget Office',
        head: 'Ivy R. Redison',
        totalCost: 1_374_276.0,
      },
      {
        department: "Provincial Assessor's Office",
        head: 'Kokoy B. Soguilon',
        totalCost: 2_935_000.0,
      },
      {
        department: 'Provincial Accounting Office',
        head: 'Theresa S. Templonuevo',
        totalCost: 1_872_500.0,
      },
      {
        department: 'Provincial General Services Office',
        head: 'Jericson C. Bello',
        totalCost: 6_811_334.0,
      },
      {
        department: 'Provincial Legal Office',
        head: 'Atty. Lorielle L. Rovero',
        totalCost: 350_000.0,
      },
      {
        department: 'Aklan Provincial Internal Audit Office',
        head: 'Brenda O. Magalit',
        totalCost: 110_670.0,
      },
      {
        department: 'Aklan Provincial Info. & Comm. Technology Office',
        head: 'Donald Rubio',
        totalCost: 9_019_960.0,
      },
      {
        department: 'Commission On Audit',
        head: 'Atty. Joseph Laguna',
        totalCost: 364_030.0,
      },
      {
        department: 'Office of the Provincial Agriculturist',
        head: 'Engr. Alexys Apolonio',
        totalCost: 15_611_920.0,
      },
      {
        department: "Provincial Engineer's Office",
        head: 'Engr. Edelzon T. Magalit',
        totalCost: 378_704_153.19,
      },
      {
        department: 'Office of the Provincial Veterinarian',
        head: 'Dr. Ma. Cyrosa Leen Mabel C. Siñel',
        totalCost: 4_912_246.0,
      },
      {
        department: 'Aklan Environment & Natural Resources Office',
        head: 'Engr. Kenneth Almalbis',
        totalCost: 2_430_206.0,
      },
      {
        department: 'Aklan Provincial Tourism Office',
        head: 'Roselle Ruiz',
        totalCost: 26_988_842.0,
      },
      {
        department: "Office of the Prov'l Public Employment Service Manager",
        head: 'Marsh B. Bernabe',
        totalCost: 5_453_950.0,
      },
      {
        department: 'Provincial Social Welfare & Development Office',
        head: 'Evangelina F. Gallega',
        totalCost: 21_866_100.0,
      },
      {
        department: 'Aklan Provincial Population & Gender Office',
        head: 'Franklin L. Quimpo',
        totalCost: 1_559_624.0,
      },
      {
        department: 'Provincial Health Office',
        head: 'Dr. Leslie Ann L. Sedillo',
        totalCost: 16_088_014.5,
      },
      {
        department: 'Buruanga Municipal Hospital',
        head: 'Dr. Niño Jerryl S. Dela Torre',
        totalCost: 1_089_922.0,
      },
      {
        department: 'Libacao Municipal Infirmary',
        head: 'Dr. Stig U. Valencia',
        totalCost: 1_569_936.0,
      },
      {
        department: 'Ciriaco S. Tirol Hospital',
        head: 'Dr. Karol Mark M. Lachica',
        totalCost: 4_125_192.04,
      },
      {
        department: 'Don Leovigildo N. Diapo Sr. Municipal Hospital',
        head: 'Dr. Stevens N. Fuentes',
        totalCost: 1_279_480.0,
      },
      {
        department: 'Malay Municipal Hospital',
        head: 'Dr. Janeth P. Japitana',
        totalCost: 2_336_000.0,
      },
      {
        department: 'Godofredo P. Ramos Hospital',
        head: 'Dr. Julius R. Gonzales',
        totalCost: 6_196_819.2,
      },
      {
        department: 'EEDD-Admin Support Services',
        head: 'Dr. Michael I. Terencio',
        totalCost: 422_000.0,
      },
      {
        department: 'EEDD-CCO',
        head: 'Dr. Michael I. Terencio',
        totalCost: 1_662_370.0,
      },
      {
        department: 'EEDD-Port Operations',
        head: 'Esel L. Flores',
        totalCost: 135_364_061.0,
      },
      {
        department: 'EEDD-RHO',
        head: 'Palmi I. Fernandez',
        totalCost: 5_221_186.0,
      },
      {
        department: 'Dr. Rafael S. Tumbokon Memorial Hospital',
        head: 'Dr. Cornelio V. Cuachon, Jr.',
        totalCost: 36_715_148.03,
      },
      {
        department: 'Ibajay District Hospital',
        head: 'Dr. Mary Jean A. Gelito',
        totalCost: 29_535_825.0,
      },
      {
        department: 'Department of Education',
        head: 'Feliciano C. Buenafe, Jr. CESO VI',
        totalCost: 22_438_738.0,
      },
      {
        department: 'Department of Labor and Employment',
        head: 'Marsh B. Bernabe',
        totalCost: 3_091_880.0,
      },
    ],
  },
];

export default procurementPlan;
