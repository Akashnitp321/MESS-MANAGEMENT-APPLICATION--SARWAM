const menu={
  "Monday": {
    "Breakfast": ["Milk", "Banana", "Oats"],
    "Lunch": ["Grilled Chicken", "Salad", "Olive Oil Dressing"],
    "Dinner": ["Spaghetti", "Marinara Sauce", "Garlic Bread"],
    "Snacks": ["Apple Slices", "Peanut Butter"]
  },
  "Tuesday": {
    "Breakfast": ["Scrambled Eggs", "Toast"],
    "Lunch": ["Turkey Sandwich", "Lettuce", "Tomato"],
    "Dinner": ["Baked Salmon", "Roasted Vegetables"],
    "Snacks": ["Greek Yogurt", "Honey"]
  },
  "Wednesday": {
    "Breakfast": ["Smoothie", "Spinach", "Mango", "Protein Powder"],
    "Lunch": ["Veggie Wrap", "Hummus"],
    "Dinner": ["Chicken Curry", "Rice"],
    "Snacks": ["Trail Mix"]
  },
  "Thursday": {
    "Breakfast": ["Pancakes", "Maple Syrup"],
    "Lunch": ["Caesar Salad", "Grilled Shrimp"],
    "Dinner": ["Beef Stir-Fry", "Noodles"],
    "Snacks": ["Carrot Sticks", "Ranch Dip"]
  },
  "Friday": {
    "Breakfast": ["Avocado Toast", "Poached Egg"],
    "Lunch": ["Quinoa Bowl", "Roasted Chickpeas"],
    "Dinner": ["Pizza", "Mixed Toppings"],
    "Snacks": ["Protein Bar"]
  },
  "Saturday": {
    "Breakfast": ["French Toast", "Berries"],
    "Lunch": ["BLT Sandwich"],
    "Dinner": ["BBQ Chicken", "Corn on the Cob"],
    "Snacks": ["Popcorn"]
  },
  "Sunday": {
    "Breakfast": ["Bagel", "Cream Cheese"],
    "Lunch": ["Pasta Salad", "Veggies"],
    "Dinner": ["Roast Beef", "Mashed Potatoes"],
    "Snacks": ["Chocolate Chip Cookies"]
  }
}



export const getMenu= (req,res)=>{
    const day=req.body?.day ;
    
    if(!menu[day]){
        return res.status(400).json({error:`Menu not found for ${day}`});
    }

    return res.status(200).json(menu[day]);



}