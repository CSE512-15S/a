# a3-liusuw

## Team Member

Liusu Wang liusuw@uw.edu

## Top 10 Seeded Male Tennis Players

This visualzation demostrates three major portions about the top 10 seeded male tennis players (2015). The first one is the relationship between the major tennis tournament (legends) finals and the players, which illustrates which finals of the tournaments these players attended. Another one is the relationship between the titles of the tourments and the players, which illustrates how many titles they acctually achieved in these finals. The last one illustrates the court types in these finals and the details of the players attended.

## Running Instructions

Access my visualization at http://cse512-15s.github.io/a3-liusuw/ or download this repository and run python -m SimpleHTTPServer 8000 and access this from http://localhost:8000/. I recommend using Chrome for ideal viewing.


## Storyboard

### Initial visualization

The initial visualization will display all the relationships between the legends and the players. The sizes of the rectangles illustrate the portions of these tournament finals and the players. For example, the finals of ATP masters tournament have the most of the players attended, that rectangle appears the largest one. Same as this, the more finals a player attended, the larger his representing rectangle should be. In addition, each legend has its unique color in order to distinguish it with others. 

![initial](https://cloud.githubusercontent.com/assets/4379884/7588735/d085679a-f873-11e4-8e08-0ab7dd3b92eb.jpg)

### Hover a legend
If the user hover any name of the rectangle of one legend either in the "attended finals" or "claimed titles" column, the visualization will dynamically change the sizes of the players. It will only display this legend and the corresponding players who attended these finals. The same with the claimed titles as well, which should dynamically change the size.

![legend](https://cloud.githubusercontent.com/assets/4379884/7588736/d29a949c-f873-11e4-9847-e3fd162c5e86.jpg)

### Hover a player

If the user hover any name of the rectangle of one player, the visualization will dynamically change the sizes of the legends on both "attended finals" and "claimed titles" column. It will only display this player and the corresponding legends. 

![player](https://cloud.githubusercontent.com/assets/4379884/7588738/d48ddc1e-f873-11e4-9b09-4d80f2e1cc2f.jpg)

### Hover a color on pie chart 

This pie chart visualize the portion of each court type: clay, grass, and hard court. The color of each portion is the same with its court color in the real world. By hovering the color, the user will see the details of the players, e.g. who attended the finals and won the title on this type of court, in a sorted order.

![court type](https://cloud.githubusercontent.com/assets/4379884/7588740/d61664ca-f873-11e4-9f94-e4e9eedb412a.jpg)


## Changes between Storyboard and the Final Implementation 

To be more clear, I seperated the "attended finals - players - claimed titles" visualization into two different ones. These two visualization used the same logic in the implementation. I added the numbers to the charts to be more clear, e.g. numbers and percentages of the legends, the count of the titles that the players won. So do the pie charts, they have more data descriptions. In addition, by hovering the court type on the pie charts, the user can see more details, e.g. how many titles of the players won and their percentages.

## Development Process

For the development process, I collected and analyzed the initial data set. I defined the audience to be general tennis lovers who usually do not learn too deep into tennis games and the players. In this way, I cleaned up the dataset and found the most feasible and probably the part that the audience care about the most - the finals, titles, court types, and the players. I brainstormed the idea, iteratively designed many storyboards, and selected the above ones here. I did research on D3 and learned it from the online tutorials and then started with the basic ones. Later, I started putting more and intergrated them together. During this project, I also improved debugging skills on the Chrome DevTools. In all, I spent approximately over 110 hours putting this visualization together. A significant portion of time was spent getting familiar with javascript and D3 and secondly the iterative design process. 

## Future Improvement
For the future design and implementation, I hope to build the features that allows users to select a specific year to see the visualization of the finals and the players. In addition, I would like to implement bar charts for the players shown on the court type pie charts. For example, by hovering the colors on one pie chart, another corresponding bar chart for the players would dynamically illustrate the portions and numbers of the players invovled.
