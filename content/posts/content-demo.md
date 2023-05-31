---
title: Content demo
date: 2022-01-04
slug: content-demo
thumbnail: /images/economic_crisis_trans.png
headerimage: /images/economic_crisis_trans.png
---

\* THIS ARTICLE HAS BEEN WRITTEN TO DEMO DIFFERENT CONTENT TYPES \*

A sentence before the inline pice of code bit. Some random text with an inline piece of code `long_variable = calculate_average(numbers)` stuck in the middle. This is just another test sentace so see whether the padding of the inline code piece affects the rest of the formatting.

This sentence contains a link to [bbc news](https://www.bbc.co.uk/news) which is a news site. This is a another sentence after the one containing a hyperlink. Test link

I am making a statement about the earths circumference[^earths circum] and this is the end of the sentence.

Take the following [link]({{< ref "healthy-eating.md" >}}) to a blog article about healthy eating.

[^earths circum]: https://en.wikipedia.org/wiki/Earth

## Code


### C++ Code Block
```cpp
#include <iostream>

int calculateSquare(int num) {
    int square = num * num;
    return square;
}

int main() {
    int number = 5;
    int result = calculateSquare(number);
    std::cout << "Square of " << number << " is: " << result << std::endl;
    return 0;
}
```

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


## Video

{{< youtube id=xS8MVFxcqZg title="Spain Flyover" >}}

