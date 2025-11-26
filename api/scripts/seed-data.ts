import { pool } from '../src/db/client.js';

const main = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Clear existing data
        console.log('Clearing existing data...');
        await client.query('DELETE FROM public.spati_amenities');
        await client.query('DELETE FROM public.spati_locations');
        await client.query('DELETE FROM public.amenities');
        await client.query('DELETE FROM public.moods');

        // Insert Moods
        console.log('Inserting moods...');
        await client.query(`
      INSERT INTO public.moods (id, name, color) VALUES
      ('2b370d9d-495c-45fb-8b33-63e75669436a', 'Sporty', '#00FF1E'),
      ('c02992f2-3534-411b-9743-f707cb8514a6', 'Night owl', '#808080'),
      ('98a46feb-9b40-4c59-96d9-7d7b03f03f78', 'Disco', '#FF00AE');
    `);

        // Insert Amenities
        console.log('Inserting amenities...');
        await client.query(`
      INSERT INTO public.amenities (id, name, image_url) VALUES
      ('eef3bc89-ea8b-47b1-8ff8-b6680fa429ab', 'Cool name', NULL),
      ('7a80ae9f-36cf-4874-a7b6-138f0e0b0222', 'DVD rental', NULL),
      ('626315a4-579c-444e-99e0-4ba5fdf56c0f', 'ATM', 'https://storage.googleapis.com/spatify/amenities%2F0dec0ff2-552a-43bd-afdd-652cbd4ba6a9.png'),
      ('f3704765-5eca-4bc5-87b7-d9c65134309a', 'Backgammon (Tavla)', 'https://storage.googleapis.com/spatify/amenities%2F168ea2ec-24e7-4ac4-84d5-e54f35ac6588.png'),
      ('33ec6f67-c403-4d22-9641-81a8ee57e849', 'Baking goods', 'https://storage.googleapis.com/spatify/amenities%2Ff9ef9138-6c60-4527-9cd9-8172eda5a377.png'),
      ('5c48fb43-ea79-4ea9-99f8-4c065caf4fdd', 'Chess', 'https://storage.googleapis.com/spatify/amenities%2F2f78efdc-41d1-4dfa-889b-ec532a5f40c7.png'),
      ('9636d772-7c89-41cc-bf6c-9b70095c3883', '24/7', 'https://storage.googleapis.com/spatify/amenities%2F6897bddc-f3f7-492f-8a25-2fc84b691a60.png'),
      ('4d096a48-69b2-492b-b073-41cea13aed6a', 'Pingpong', 'https://storage.googleapis.com/spatify/amenities%2F2b14ed97-b5f5-4046-b2bc-65b29b0204dd.png'),
      ('d6a2b270-f612-4246-b735-ce610481627e', 'Interesting locals', 'https://storage.googleapis.com/spatify/amenities%2F0c918f24-2c7b-4aab-aef2-58d2466104b1.png'),
      ('b3dd812f-b6fd-43d0-a572-3ed7ec81d6a9', 'Freshly squeezed juice', 'https://storage.googleapis.com/spatify/amenities%2Fc80f4056-c414-453e-84c9-c1025edc4f83.png'),
      ('a2d3c5f2-bfec-41fe-aa68-b4b4e515edad', 'Football screenings', 'https://storage.googleapis.com/spatify/amenities%2Ff20ed623-29d5-454c-bc39-7786ff4ad862.png'),
      ('703db25f-c87b-49a7-82d6-0ad94cbf317b', 'Souvenir shop', 'https://storage.googleapis.com/spatify/amenities%2F406d2d51-8354-4ec3-a5a2-8161107c3887.png'),
      ('165be213-5ebc-41e3-ab0c-65d614af0a53', 'Massage chair', 'https://storage.googleapis.com/spatify/amenities%2Ffcc1393f-0c59-4d82-a03a-77a1d7e04c2f.png'),
      ('cac42885-7870-4319-b815-b40489e76585', 'Toilet', 'https://storage.googleapis.com/spatify/amenities%2F393a6b88-4ea9-421a-8a47-1a58de4e460a.png'),
      ('fa57dccf-c12d-4e83-a3be-191636207593', 'Outdoor seats', 'https://storage.googleapis.com/spatify/amenities%2F47861d60-1be6-4292-85c3-d3ca4514f43c.png'),
      ('2cb71cb4-58a3-451d-9132-6e244557a93f', 'Fooßball table', 'https://storage.googleapis.com/spatify/amenities%2F61e07d43-7b9f-4555-a6b8-5743df557916.png'),
      ('96a8235b-6918-449f-bce7-821f8c6d3323', 'Parcel pickup', 'https://storage.googleapis.com/spatify/amenities%2F800a81f6-a46a-4851-a709-83bacefb7edb.png'),
      ('4c0d026f-72bb-4bd6-9427-2c22a09d1aae', 'Music', 'https://storage.googleapis.com/spatify/amenities%2F89b50b20-2b59-4fab-9f6a-286788fd12ef.png'),
      ('f7e3d7df-fd2a-4523-ae9a-52fca44e6993', 'Party', 'https://storage.googleapis.com/spatify/amenities%2Ff3e87e25-1678-422e-8c58-1eb89fba2a2f.png'),
      ('b44a222f-67f8-44b3-baa0-cd30086d1977', 'Indoor seats', 'https://storage.googleapis.com/spatify/amenities%2F8c97baae-a3b5-4334-9cae-7d716235f959.png'),
      ('204d608f-e557-43d6-8c7c-05b6568cdd9c', 'Socializing spot', 'https://storage.googleapis.com/spatify/amenities%2F4e9b6442-61bd-4b2d-99e3-dfc4ed5dde43.png'),
      ('7712320a-6e24-4b17-a842-f2e4039b34bf', 'Lotto', 'https://storage.googleapis.com/spatify/amenities%2Faaa46f46-fc38-43b5-ab51-61589cb1d670.png'),
      ('f3d60495-a25c-424c-88ca-9de85dc49a29', 'Copy machine/Fax/Print', 'https://storage.googleapis.com/spatify/amenities%2Fc11bdcb4-2382-46f3-a299-5afa47f30580.png'),
      ('601a600f-b0a9-4c62-8c8b-127d206f22dd', 'Sandwich', 'https://storage.googleapis.com/spatify/amenities%2F7e9b9721-1b79-46c4-9097-6ab8abbacafb.png'),
      ('d9b48c55-56fa-4e17-a037-58909c4319a6', 'cafe', 'https://storage.googleapis.com/spatify/amenities%2Fcbdea23f-1d56-47b8-ab32-ba6c35279f87.png');
    `);

        // Insert Spati Locations
        console.log('Inserting spati locations...');
        await client.query(`
      INSERT INTO public.spati_locations (id, store_name, description, lat, lng, address, opening_hours, store_type, rating, image_url, mood_id) VALUES
      ('1a516a8e-3353-496f-bf56-69ecc604576c', 'Siri Spati & Asia Afro shop', 'Siri Späti in Moabit is the kind of late-night sanctuary you only appreciate once you realize how little else is open around it. A beacon in an otherwise quiet stretch, it stays open deep into the night and radiates a warm, almost village-like familiarity. The owner—known for his calm smile and perpetual chess battles on the sidewalk—gives the place a uniquely communal pulse. Whether you''re grabbing a quick drink on your way home or lingering to watch a tense endgame unfold, Siri Späti offers more than convenience; it offers a pocket of humanity in a neighborhood that often sleeps early.', 52.5244539, 13.3491893, 'Alt-Moabit 107, 10559 berlin', '11 am - 2 am', 'Chill', 2.5, 'https://storage.googleapis.com/spatify/spatis%2Fa8030207-1e16-4378-90bd-71f28ac0708c.jpg', NULL),

      ('5d72222c-35c2-402e-9f83-4bc42e176b6d', 'Videoservice & Bakery', 'Video Service & Bakery in Prenzlauer Berg is a nostalgic nod to a bygone era—a blue-themed time capsule that feels like stepping into a 90s Blockbuster, minus the late fees and shoulder pads. Once famed for its signature DVD rental wall, the shop carried the promise of a true five-star Späti, the sort of place that could have rewritten the genre with its quirky hybrid of carbs and cinema. Yet, despite its undeniable charm, mixed reports regarding the owner''s hospitality and the quiet discontinuation of its beloved DVD service hold it back from achieving its full potential. Still, for those who appreciate a flash of retro Berlin and a uniquely themed corner-shop experience, Video Service & Bakery remains a worthwhile stop—equal parts curiosity, memory, and local character.', 52.5349939, 13.4062697, 'Kastanienallee 67, 10119 Berlin', '9 am - 11 pm weekdays / 1 am weekends', 'Hipster landmark', 3, NULL, NULL),

      ('ed5414f0-e1d9-4b68-b62d-17d9090a0f55', 'Day & Night', 'Day & Night is a rare Friedrichshain gem—one of those elusive Späti Pokémon whose existence you almost doubt until you step inside. Open until 1 a.m. on weekdays and a generous 3 a.m. on weekends, it offers the kind of atmosphere most late-night corners only dream of: indoor and outdoor seating, a clean and surprisingly reliable toilet, and—its crown jewel—a full ping-pong table that transforms casual beer runs into spontaneous tournaments. The owner is notably warm, handing you not just a drink but the remote to curate your own soundtrack, giving the space an unforced communal energy. Buzzing with young locals and night wanderers, Day & Night is equally suited for a few hours of playful ping-pong or a perfectly calibrated pre-drink before heading toward Boxhagener Platz or Warschauer Straße.', 52.5119505, 13.4563775, 'Grünberger Straße 55, 10245 Berlin', '11 am - 1 am weekdays / 3 am weekends', 'Sporty', 5, 'https://storage.googleapis.com/spatify/spatis%2Fb0ac1d10-253b-4893-9da4-32653af430e6.jpg', '2b370d9d-495c-45fb-8b33-63e75669436a'),

      ('5edcceb1-116d-4b89-9df0-3418cc21bc5a', 'Drink station', 'Pink neon spati, right at the crossroad in the busy U eberswalder, open all year around!', 52.5408244, 13.4127145, 'Danziger Straße 2, 10435 Berlin', '24/7', 'Night owl', 2.5, NULL, 'c02992f2-3534-411b-9743-f707cb8514a6'),

      ('9f64ce80-9152-46ea-a33a-ee6bfc1fa639', 'Drinkhall', 'Drinkhall in Kreuzberg is impossible to overlook—a constantly buzzing, high-energy Späti that feels more like a compact street bar than a corner shop. Often packed to the brim, it draws a lively crowd with its music, reliable toilet (a luxury in Späti-land), and a rare lineup that includes tap beer and seasonal Glühwein served with surprising pride. Its beer selection is impressively broad, making it a go-to pregame hub or a spontaneous social stop for anyone wandering through Kreuzberg''s nighttime current. Chaotic in the best way, Drinkhall isn''t just a Späti—it''s an experience you spot from a distance and somehow always end up joining.', 52.5010614, 13.4194542, 'Oranienstraße 177, 10999 Berlin', '24/7', 'Disco', 4.5, NULL, '98a46feb-9b40-4c59-96d9-7d7b03f03f78');
    `);

        // Insert Spati Amenities
        console.log('Inserting spati amenities...');
        await client.query(`
      INSERT INTO public.spati_amenities (spati_id, amenity_id) VALUES
      ('5d72222c-35c2-402e-9f83-4bc42e176b6d', 'fa57dccf-c12d-4e83-a3be-191636207593'),
      ('5d72222c-35c2-402e-9f83-4bc42e176b6d', '9636d772-7c89-41cc-bf6c-9b70095c3883'),
      ('5d72222c-35c2-402e-9f83-4bc42e176b6d', '33ec6f67-c403-4d22-9641-81a8ee57e849'),
      ('5d72222c-35c2-402e-9f83-4bc42e176b6d', '626315a4-579c-444e-99e0-4ba5fdf56c0f'),
      ('5d72222c-35c2-402e-9f83-4bc42e176b6d', '7a80ae9f-36cf-4874-a7b6-138f0e0b0222'),
      ('1a516a8e-3353-496f-bf56-69ecc604576c', 'fa57dccf-c12d-4e83-a3be-191636207593'),
      ('1a516a8e-3353-496f-bf56-69ecc604576c', '5c48fb43-ea79-4ea9-99f8-4c065caf4fdd'),
      ('ed5414f0-e1d9-4b68-b62d-17d9090a0f55', '9636d772-7c89-41cc-bf6c-9b70095c3883'),
      ('ed5414f0-e1d9-4b68-b62d-17d9090a0f55', '4d096a48-69b2-492b-b073-41cea13aed6a'),
      ('ed5414f0-e1d9-4b68-b62d-17d9090a0f55', 'cac42885-7870-4319-b815-b40489e76585'),
      ('ed5414f0-e1d9-4b68-b62d-17d9090a0f55', 'fa57dccf-c12d-4e83-a3be-191636207593'),
      ('ed5414f0-e1d9-4b68-b62d-17d9090a0f55', 'b44a222f-67f8-44b3-baa0-cd30086d1977'),
      ('5edcceb1-116d-4b89-9df0-3418cc21bc5a', '9636d772-7c89-41cc-bf6c-9b70095c3883'),
      ('5edcceb1-116d-4b89-9df0-3418cc21bc5a', 'fa57dccf-c12d-4e83-a3be-191636207593'),
      ('9f64ce80-9152-46ea-a33a-ee6bfc1fa639', '9636d772-7c89-41cc-bf6c-9b70095c3883'),
      ('9f64ce80-9152-46ea-a33a-ee6bfc1fa639', 'd6a2b270-f612-4246-b735-ce610481627e'),
      ('9f64ce80-9152-46ea-a33a-ee6bfc1fa639', 'cac42885-7870-4319-b815-b40489e76585'),
      ('9f64ce80-9152-46ea-a33a-ee6bfc1fa639', 'fa57dccf-c12d-4e83-a3be-191636207593'),
      ('9f64ce80-9152-46ea-a33a-ee6bfc1fa639', '4c0d026f-72bb-4bd6-9427-2c22a09d1aae'),
      ('9f64ce80-9152-46ea-a33a-ee6bfc1fa639', 'b44a222f-67f8-44b3-baa0-cd30086d1977');
    `);

        await client.query('COMMIT');
        console.log('Database seeded successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Failed to seed database:', e);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

main();
