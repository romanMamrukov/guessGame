const supabaseUrl = 'https://sfgsgcpzesjinkdlsrkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZ3NnY3B6ZXNqaW5rZGxzcmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzY4NjAsImV4cCI6MjA4OTM1Mjg2MH0.7B-lTuMVoU5zMEM3jtzEw6j32JzSI3VfCOtOoD7Hj9Q';

const sampleData = [
  {
    name: 'Elephant',
    category: 'Animals',
    difficulty: 'Hard',
    info: 'Elephants are the largest existing land animals.',
    imagepath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Elephant_Diversity.jpg/800px-Elephant_Diversity.jpg'
  },
  {
    name: 'Eiffel Tower',
    category: 'Landmarks',
    difficulty: 'Easy',
    info: 'The Eiffel Tower was constructed from 1887 to 1889 as the centerpiece of the 1889 World\'s Fair.',
    imagepath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/800px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg'
  },
  {
    name: 'Pizza',
    category: 'Food',
    difficulty: 'Easy',
    info: 'Pizza was first invented in Naples, Italy.',
    imagepath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg/800px-Eq_it-na_pizza-margherita_sep2005_sml.jpg'
  },
  {
    name: 'Microscope',
    category: 'Science',
    difficulty: 'Medium',
    info: 'The first optical microscopes appeared in the Netherlands in the 1590s.',
    imagepath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Optical_microscope_nikon_alphaphot_%.jpg/800px-Optical_microscope_nikon_alphaphot_%.jpg'
  },
  {
    name: 'Electric Guitar',
    category: 'Instruments',
    difficulty: 'Medium',
    info: 'Invented in 1931, the amplified electric guitar was adopted by jazz guitarists.',
    imagepath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Fender_Stratocaster_Electric_Guitar.jpg/800px-Fender_Stratocaster_Electric_Guitar.jpg'
  }
];

async function populateDb() {
  console.log('Starting database population...');

  for (const item of sampleData) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/objects`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`Failed to insert ${item.name}: ${response.status} ${err}`);
      } else {
        const data = await response.json();
        console.log(`Successfully inserted ${item.name} with ID: ${data[0]?.id}`);
      }
    } catch (e) {
      console.error(`Error inserting ${item.name}:`, e);
    }
  }

  console.log('Database population complete.');
}

populateDb();
