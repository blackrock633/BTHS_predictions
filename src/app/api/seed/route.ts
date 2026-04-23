import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const names = [
  'Aarav Houghton', 'aaro d', 'Abbas Khan', 'adrian kurasiewcz', 'alan propisnoy',
  'Alessandro Brindisi', 'Alex Bast', 'Alex Jones', 'Alissa Challand', 'Amaiya McLaren',
  'Amelia French', 'Amir Akhmetzianov', 'Anatole Blechman', 'Arthur Opiola', 'Augustus Colt',
  'Ava Anderson', 'Ava Dobran', 'Avash G', 'Bee Bruce', 'Ben Smull',
  'Benjamin Title', 'Benson Zhou', 'Brady Fenton', 'Bruno Taormina', 'Carolyn Brukner',
  'Carrie Corpas', 'Cassie Feinberg', 'Chloe Gao', 'conrad ratz', 'Corbin Toledano',
  'Crystal Tsang', 'Dagan Warinf', 'Dalia Elmadboly', 'Dalia Khazaei', 'Daniel Kirmayer',
  'Daryna Mikhaylova', 'Dennis Yudin', 'dillon chapuli', 'Duncan May', 'dylan chanti',
  'dylan marfo', 'dylan wong', 'Edward Iancu', 'Eli Z', 'Elias Botsford',
  'Enzo Bera', 'Evan Gao', 'Evan Tesdell', 'Fairuz Tarannum', 'Finn Adomanis',
  'Gabi Mar', 'Gabriel Young', 'Gala Kamal-Bordelois', 'Gus Crawford', 'Hannah Cheng',
  'iain fulnecky', 'Ian Yun', 'Isaac Cohen', 'isabelle ross', 'ivy heller',
  'Izzy Jones', 'Jack Persak', 'Jacka Dubov', 'Jake Donahue', 'James Simmons',
  'jennifer yang', 'Jimmy White', 'Joseph Ramos', 'Julian Jovanovic', 'Julian Weaver',
  'julian zinner', 'Kae Baylor', 'Karoline Deaza', 'Kasper Harsu', 'Keem Azimov',
  'Kimberly Pichardo', 'Kira Gottlieb', 'Kona Sullivan', 'Lamisha B', 'LeighRose P',
  'Leo Siegel', 'Leon Du', 'Liam Craig', 'Louis Li', 'Lulu Galea',
  'Maahika Nair', 'maddie ward', 'maheer omran', 'Margaux Koudella', 'Marilyn Cowlishaw',
  'Marina Kim', 'Marion Walker', 'markus lin', 'Masamitsu Jindo', 'Matilda Budin',
  'Matthew Chang', 'Matthew Rotondi', 'Matthew Smakov', 'Max Dekhter', 'Maximus Zaltsman',
  'Maxwell Lee', 'Maya Shadrin', 'Mdot Walkemdownwitdachop', 'Mikhail Ashcheulau', 'Miles Adomanis',
  'Miles Bohorquez', 'Milo Kiely-Miller', 'Milo Schwartz', 'Molly Brown', 'Mubtasim Hossain',
  'munira rafikova', 'Nate Schulman', 'Nathan Yelin', 'Nathaniel Kurtz', 'Natsume Odani',
  'Nick Conti', 'Nico Wiedemann', 'Nicole Czajkowski', 'Nicole Polyan', 'Nita Gamkrel',
  'Noah Dockery', 'noah fogel', 'Noah Kato', 'Noam Spincemaille', 'Nola Rohrer',
  'Olivia Kim', 'Qiqi Li', 'Quintus Simmons', 'Ramzy Abdulsattar', 'Ranveer Hothi',
  'Rebecca Ho Yun', 'rehan ahmed', 'Rewa Okubo', 'Rickie S', 'Rochelle Zabarko',
  'roscoe baram', 'Rufaro Mwandiambira', 'Sadathi Hettiarachchige', 'Sam Finessed', 'sam rodman',
  'Sarah Markowitz', 'Shaan Chawhan', 'Shrey Vertes', 'Sofia Hsu', 'sojourner whalen',
  'Sonia Rojas-Pederzini', 'sonya vakulenko', 'Sophia Zanier', 'Stephanie Huang', 'Stuti Das',
  'sy bines', 'Szymon Wisniewski', 'Teddy Kos', 'Thanh Nguyen', 'Theo Ivan',
  'Tianxiao Liu', 'Toka Hussein', 'Valentina arkin', 'Valerie Z', 'veronica movchan',
  'Veronika Borek', 'Victoriya Zhuravlyova', 'Vina C', 'Vincent Chen', 'Violet Wong',
  'Vivian Eiden', 'Walied Eldib', 'Yalini Sampathkumar', 'Yousef Ashour', 'Zachariah Whitby',
  'zaid yafaee', 'Zev Torrance', 'Zoe Taylor'
]

export async function POST() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const insertData = names.map(n => ({ name: n, is_alive: true }))
    
    // Insert all at once
    const { error } = await supabaseAdmin.from('candidates').insert(insertData)
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, count: names.length })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
