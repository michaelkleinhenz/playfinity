<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title></title>
    <meta name='Generator' content='Zim 0.59'>
    <style type='text/css'>
        a          { text-decoration: none      }
        a:hover    { text-decoration: underline }
        a:active   { text-decoration: underline }
        strike     { color: grey                }
        u          { text-decoration: none;
            background-color: yellow   }
        tt         { color: #2e3436;            }
        pre        { color: #2e3436;
            margin-left: 20px          }
        h1         { text-decoration: underline;
            color: #4e9a06             }
        h2         { color: #4e9a06             }
        h3         { color: #4e9a06             }
        h4         { color: #4e9a06             }
        h5         { color: #4e9a06             }
        span.insen { color: grey                }
    </style>
</head>
<body>

<!-- Header -->

[ <span class='insen'>Prev</span> ]

[ <a href='/'>Index</a> ]

[ <span class='insen'>Next</span> ]

<!-- End Header -->

<hr />

<!-- Wiki content -->

<h1>AchievementSystem</h1>

<p>
    Created Freitag 12 April 2013<br>
</p>

<h3>QuestorWiki</h3>
<p>
    <a href="https://admin.goquestor.com/wiki/index.php/Achievement_System" title="https://admin.goquestor.com/wiki/index.php/Achievement_System" class="https">https://admin.goquestor.com/wiki/index.php/Achievement_System</a><br>
    <a href="https://admin.goquestor.com/wiki/index.php/Achievement_Integration" title="https://admin.goquestor.com/wiki/index.php/Achievement_Integration" class="https">https://admin.goquestor.com/wiki/index.php/Achievement_Integration</a><br>
    <a href="https://admin.goquestor.com/wiki/index.php/Achievement_Service" title="https://admin.goquestor.com/wiki/index.php/Achievement_Service" class="https">https://admin.goquestor.com/wiki/index.php/Achievement_Service</a><br>
</p>

<h3>Example</h3>
<p>
    <strong>Create databases</strong><br>
<div style='padding-left: 30pt'>
    <a href="http://localhost:5984/_utils/index.html" title="http://localhost:5984/_utils/index.html" class="http">http://localhost:5984/_utils/index.html</a><br>
    Create database achievement<br>
    Create database achievement_instance<br>
</div>
<strong>Upload designs to databases</strong><br>
<div style='padding-left: 30pt'>
    cd AchvSystemJS/db<br>
    ./uploadDesign.sh achievement achievement designs/achievement_design.json<br>
    ./uploadDesign.sh achievement_instance achievement_instance designs/achievement_instance_design.json<br>
</div>
<strong>Install npm</strong><br>
<div style='padding-left: 30pt'>
    cd AchvSystemJS<br>
    npm install<br>
</div>
<strong>Start node</strong><br>
<div style='padding-left: 30pt'>
    node src/main.js<br>
</div>
<strong>Create achievement models</strong><br>
<div style='padding-left: 30pt'>
    cd qbadge-system/integrationtests/server<br>
    ./PUT_Achievement.sh ../../unittests/fixture/achievement/Model_MyOneShotAchievement.json<br>
    ./PUT_Achievement.sh ../../unittests/fixture/achievement/Model_MyCounterAchievement.json<br>
    ./PUT_Achievement.sh ../../unittests/fixture/achievement/Model_MyOneShotAchievement.json<br>
</div>
</p>

<p>
    <strong>Read achievement models</strong><br>
<div style='padding-left: 30pt'>
    <a href="http://localhost:8080/store/model/admin/My_Hunt" title="http://localhost:8080/store/model/admin/My_Hunt" class="http">http://localhost:8080/store/model/admin/My_Hunt</a><br>
</div>
</p>

<p>
    <strong>Init the achievement instances</strong><br>
<div style='padding-left: 30pt'>
    curl -X POST <a href="http://localhost:8080/store/model/init/admin/My_Hunt/tim" title="http://localhost:8080/store/model/init/admin/My_Hunt/tim" class="http">http://localhost:8080/store/model/init/admin/My_Hunt/tim</a><br>
</div>
</p>

<p>
    <strong>Read the achievement instances</strong><br>
<div style='padding-left: 30pt'>
    <a href="http://localhost:8080/store/instance/My_Hunt/tim" title="http://localhost:8080/store/instance/My_Hunt/tim" class="http">http://localhost:8080/store/instance/My_Hunt/tim</a><br>
</div>
</p>

<p>
    <strong>Trigger events</strong><br>
<div style='padding-left: 30pt'>
    cd qbadge-system/integrationstests/server<br>
    ./PUT_Event.sh ../../unittests/fixture/event/MyOneShotAchievementEvent.json<br>
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json <br>
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json <br>
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json <br>
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json <br>
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json <br>
    ./PUT_Event.sh ../../unittests/fixture/event/StartMyStopWatchAchievementEvent.json<br>
</div>
</p>

<p>
    <strong>Read the achievement instances</strong><br>
<div style='padding-left: 30pt'>
    <a href="http://localhost:8080/store/cabinet/My_Hunt/tim" title="http://localhost:8080/store/cabinet/My_Hunt/tim" class="http">http://localhost:8080/store/cabinet/My_Hunt/tim</a><br>
</div>
</p>

<p>
    <strong>Read the unlocked achievements =&gt; will be in cabinet</strong><br>
<div style='padding-left: 30pt'>
    <a href="http://localhost:8080/store/cabinet/My_Hunt/tim" title="http://localhost:8080/store/cabinet/My_Hunt/tim" class="http">http://localhost:8080/store/cabinet/My_Hunt/tim</a><br>
</div>
</p>


<!-- End wiki content -->

<hr />

<!-- Attachments and Backlinks -->

<b>Backlinks:</b>		<a href='../AAANotizen.html'>AAANotizen</a>
<br><br>



<!-- End Attachments and Backlinks -->

</body>

</html>