---
title: Article Content Demo
date: 2022-01-04
slug: content-demo
thumbnail: /images/economic_crisis_trans_round.png
headerimage: /images/economic_crisis_trans_round.png
---

\* THIS ARTICLE HAS BEEN WRITTEN TO DEMO DIFFERENT CONTENT TYPES \*


## Hyperlinks

### External Link

[Hacker News](https://news.ycombinator.com/) is an online platform that curates and shares news and discussions on a wide range of topics, including technology, startups, programming, and more.


### Internal Link

An article on [healthy eating]({{< ref "23-05-17-healthy-eating.md" >}}).


### Referencing

The circumference of the Earth is the distance around its equator, measuring approximately 40,075 kilometers (24,901 miles).[^earths circum] This measurement is an essential parameter in understanding the size and scale of our planet.

[^earths circum]: https://en.wikipedia.org/wiki/Earth

## Charts

### Chart.js Bar Chart

{{< chartjs id="myChart" js="../js/chartjs_bar_chart.js" >}}

### D3.js Heatmap
{{< d3-heatmap >}}

### Highcharts.js Heatmap
{{< calorie-distribution >}}

### Highcharts.js Heatmap 2


## Code
### Inline Code

In JavaScript, you can check if a variable is an array using the following: `Array.isArray(variable)`. This code returns `true` if the variable is an array, and `false` otherwise.

### C++ Code Block
{{< highlight cpp >}}
#include <iostream>

int calc_square(int num) {
    int square = num * num;
    return square;
}

int main() {
    int n = 5
    int res = cal_square(n);
    std::cout 
    << "Square of " << n
    << " is: " << res
    << std::endl;
    return 0;
}
{{< / highlight >}}

### Python Code Block Which Overflows
```python
def calculate_average(numbers):  # This comment is to demostrate horizontal scroll for code blocks
    total = 0
    count = 0

    for num in numbers:
        if num > 0:
            total += num
            count += 1

    if count > 0:
        average = total / count
        return average
    else:
        return None

# Example usage
number_list = [10, 5, -3, 8, -2, 4, 0, 7]
result = calculate_average(number_list)
print("Average:", result)
```


## YouTube Video

{{< youtube id=xS8MVFxcqZg title="Spain Flyover" >}}

