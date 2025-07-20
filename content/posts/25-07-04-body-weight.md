---
draft: true
title: "Analysis of Daily Body Weight Fluctation"
date: 2025-07-02
slug: body-weight
thumbnail: /images/bodyweight/bodyweightthumbnail.png
---

# Preview of personal body weight

# Modeling

# Revisiting the Body Weight Moving Average

# One method to analytically tradeoff Bias and Variance

{{< body_weight_article/body_weight_history >}}

{{< body_weight_article/residuals_distribution >}}

{{< body_weight_article/body_weight_moving_average >}}

{{< slider "Moving Day Average" "moving_day_average">}}

$$ MSE = \sigma ^2 + \mu^2 $$

$$ MSE = 0.35 ^2 + 0^2 = 0.1225 $$

$$ MSE = \frac{0.35 kg}{\sqrt{d}}^{2} + (\frac{d}{2} * c_{deficit} * 0.00013)^2 $$

{{< body_weight_article/mse_optimisation >}}

{{< slider "Calorie Deficit (c_deficit)" "cdeficit_slider">}}

{{< range_slider_v2
    id="cdeficit_slider_v2"
    label="Calorie Deficit (c_deficit)"
    min="-1000"
    max="1000"
    value="0"
    step="10"
    units="kcal"
>}}


# Whats the minimum calorie surpless/deficit to be certain after a week that you are actually gaining or loosing weight after 1 month?